import Phaser from 'phaser';
import { REGION_FOOD_CONFIGS, REGION_FOOD_CONFIGS_RAW, scaleFoodConfig, type FoodItem } from '../characters/FoodConfig';
import { ColliderFactory } from '../physics/ColliderFactory';
import { EventBus } from '../EventBus';
import { useGameStore } from '../../store/gameStore';
import type { SnackData } from '../../types';

const WALL_THICKNESS = 30;
const DROP_COOLDOWN_BASE = 500;
const DROP_COOLDOWN_MAX  = 2200;

export class GameScene extends Phaser.Scene {
  private debugMode: boolean = false;
  private debugGraphics!: Phaser.GameObjects.Graphics;

  private snacks: SnackData[] = [];
  private activeItems: Phaser.Physics.Matter.Sprite[] = [];
  private nextTier = 0;
  private isFirstDrop = true;
  private canDrop = true;
  private lastDropTime = 0;
  private gameOver = false;
  private containerWidth = 0;
  private containerHeight = 0;
  private dropIndicator: Phaser.GameObjects.Graphics | null = null;
  private previewSprite: Phaser.GameObjects.Sprite | null = null;
  private dangerLine: Phaser.GameObjects.Graphics | null = null;
  private dangerTimers: Map<number, number> = new Map();
  private pointerX = 0;
  private pendingMerges: Set<string> = new Set();
  private npcQueueSize = 0;
  private pausedAt = 0;

  private currentRegion: string = 'jogja';
  private currentConfig: FoodItem[] = [];

  private scaleFactor = 1;
  private dangerLineY = 170;
  private spawnY = 140;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.currentRegion = useGameStore.getState().activeRegion || 'jogja';
    const baseConfig = REGION_FOOD_CONFIGS[this.currentRegion] || REGION_FOOD_CONFIGS['jogja'];
    
    const assetFolder = `foods_${this.currentRegion}`;
    for (const item of baseConfig) {
      this.load.image(item.textureKey, `/assets/${assetFolder}/${item.textureKey}.png`);
    }
    this.currentConfig = baseConfig;
  }

  init() {
    this.activeItems = [];
    this.gameOver = false;
    this.canDrop = true;
    this.lastDropTime = 0;
    this.pendingMerges.clear();
    this.npcQueueSize = 0;
    this.pausedAt = 0;
  }

  create() {
    this.containerWidth = Number(this.game.config.width);
    this.containerHeight = Number(this.game.config.height);
    this.pointerX = this.containerWidth / 2;

    this.scaleFactor  = this.containerHeight / 560;
    this.dangerLineY  = Math.round(this.containerHeight * 0.30);
    this.spawnY       = Math.round(this.containerHeight * 0.25);

    this.matter.world.setGravity(0, 1.5 * this.scaleFactor);

    const rawConfig = REGION_FOOD_CONFIGS_RAW[this.currentRegion] || REGION_FOOD_CONFIGS_RAW['jogja'];
    this.currentConfig = scaleFoodConfig(rawConfig, 1.1 * this.scaleFactor);

    this.debugGraphics = this.add.graphics();
    this.debugGraphics.setDepth(100);

    const w = this.containerWidth;
    const h = this.containerHeight;

    this.matter.add.rectangle(w / 2, h, w, WALL_THICKNESS, {
      isStatic: true, label: 'wall',
      friction: 0.8,
    });
    this.matter.add.rectangle(0, h / 2, WALL_THICKNESS, h, {
      isStatic: true, label: 'wall',
    });
    this.matter.add.rectangle(w, h / 2, WALL_THICKNESS, h, {
      isStatic: true, label: 'wall',
    });

    this.dangerLine = this.add.graphics();
    this.dangerLine.lineStyle(Math.max(2, Math.round(2 * this.scaleFactor)), 0xff0000, 0.6);
    this.dangerLine.lineBetween(WALL_THICKNESS, this.dangerLineY, w - WALL_THICKNESS, this.dangerLineY);

    const pxGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    const pSize = Math.round(12 * this.scaleFactor);
    pxGraphics.fillStyle(0xffffff, 1);
    pxGraphics.fillCircle(pSize / 2, pSize / 2, pSize / 2);
    pxGraphics.generateTexture('particle_circle', pSize, pSize);
    pxGraphics.destroy();
    this.dropIndicator = this.add.graphics();
    const previewConfig = this.currentConfig[0];
    this.previewSprite = this.add.sprite(this.pointerX, this.spawnY, previewConfig.textureKey);
    this.previewSprite.setDisplaySize(previewConfig.displaySize.width, previewConfig.displaySize.height);
    this.previewSprite.setAlpha(0.6);
    this.previewSprite.setDepth(50);

    this.time.delayedCall(100, () => {
      EventBus.emit('next-item', { tier: this.nextTier });
    });

    const onSetSnacks = (data: unknown) => {
      this.snacks = data as SnackData[];
      this.pickNextTier();
      this.updatePreview();
    };

    const onPause = () => {
      if (this.matter?.world) this.matter.world.pause();
      this.pausedAt = Date.now();
    };

    const onResume = () => {
      if (this.matter?.world && !this.gameOver) {
        this.matter.world.resume();
      }
      if (this.pausedAt > 0) {
        const pauseDuration = Date.now() - this.pausedAt;
        for (const [id, enteredAt] of this.dangerTimers.entries()) {
          this.dangerTimers.set(id, enteredAt + pauseDuration);
        }
        this.pausedAt = 0;
      }
    };

    const onRestart = () => {
      this.activeItems.forEach(item => item.destroy());
      this.activeItems = [];
      this.pendingMerges.clear();
      this.dangerTimers.clear();
      this.gameOver = false;
      this.canDrop = true;
      this.isFirstDrop = true;
      if (this.matter?.world) this.matter.world.resume();
      this.pickNextTier();
      this.updatePreview();
    };

    EventBus.on('set-snacks', onSetSnacks);
    EventBus.on('pause-game', onPause);
    EventBus.on('resume-game', onResume);
    EventBus.on('restart-game', onRestart);

    const onNpcQueueSize = (size: unknown) => {
      this.npcQueueSize = typeof size === 'number' ? size : 0;
    };
    EventBus.on('npc-queue-size', onNpcQueueSize);

    this.events.once('destroy', () => {
      EventBus.off('set-snacks', onSetSnacks);
      EventBus.off('pause-game', onPause);
      EventBus.off('resume-game', onResume);
      EventBus.off('restart-game', onRestart);
      EventBus.off('npc-queue-size', onNpcQueueSize);
    });

    this.input.keyboard?.on('keydown-D', () => {
      this.debugMode = !this.debugMode;
      if (!this.debugMode) {
        this.debugGraphics.clear();
      }
    });

    const handleMergeCollision = (event: any) => {
      if (this.gameOver) return;

      const pairs = event.pairs;
      for (const pair of pairs) {
        const { bodyA, bodyB } = pair;
        if (!bodyA.label || !bodyB.label) continue;

        const objA = (bodyA as any).gameObject as Phaser.Physics.Matter.Sprite | undefined;
        const objB = (bodyB as any).gameObject as Phaser.Physics.Matter.Sprite | undefined;

        if (!objA || !objB) continue;
        if (!objA.active || !objB.active) continue;

        const pairKey = bodyA.id < bodyB.id
          ? `${bodyA.id}_${bodyB.id}`
          : `${bodyB.id}_${bodyA.id}`;
        if (this.pendingMerges.has(pairKey)) continue;

        const configA = this.currentConfig.find(f => f.name === bodyA.label);
        if (!configA) continue;

        if (bodyA.label === bodyB.label) {
          const tier = configA.tier;

          const midX = (bodyA.position.x + bodyB.position.x) / 2;
          const midY = (bodyA.position.y + bodyB.position.y) / 2;

          this.pendingMerges.add(pairKey);

          this.removeItem(objA);
          this.removeItem(objB);

          const sf = this.scaleFactor;
          const particles = this.add.particles(midX, midY, 'particle_circle', {
            speed: { min: Math.round(60 * sf), max: Math.round(180 * sf) },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 700,
            quantity: 15,
            blendMode: 'NORMAL',
            tint: configA.color
          });
          particles.setDepth(60);
          particles.explode(15);
          this.time.delayedCall(1000, () => particles.destroy());

          this.applyPushEffect(midX, midY, Math.round(180 * sf), 0.25 * sf);

          if (tier < this.currentConfig.length - 1) {
            const nextTier = tier + 1;
            const configNext = this.currentConfig[nextTier];
            const pts = configNext ? configNext.mergeScore : 10;
            const nm = configNext ? configNext.name : 'Unknown';
            const isMaxTier = configNext ? configNext.nextTier === null : false;

            this.time.delayedCall(50, () => {
              this.spawnFood(nextTier, midX, midY);
              EventBus.emit('on-merge', { tier: nextTier, points: pts, name: nm });
              EventBus.emit('food-revealed', { tier: nextTier });

              this.time.delayedCall(200, () => {
                this.pendingMerges.delete(pairKey);
              });

              if (isMaxTier) {
                this.gameOver = true;
                this.canDrop = false;
                this.time.delayedCall(1500, () => {
                  if (this.matter?.world) this.matter.world.pause();
                  EventBus.emit('max-tier-reached', { name: nm, tier: nextTier });
                });
              }
            });
          } else {
            EventBus.emit('on-merge', { tier, points: 200, name: configA.name });
            this.time.delayedCall(200, () => {
              this.pendingMerges.delete(pairKey);
            });
          }
        }
      }
    };

    this.matter.world.on('collisionstart', handleMergeCollision);

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const margin = WALL_THICKNESS + Math.round(30 * this.scaleFactor);
      this.pointerX = Phaser.Math.Clamp(
        pointer.x,
        margin,
        this.containerWidth - margin,
      );
    });

    this.input.on('pointerup', () => {
      if (this.gameOver || !this.canDrop) return;

      const now = Date.now();
      if (now - this.lastDropTime < this.getDropCooldown()) return;

      this.dropSnack(this.pointerX);
    });
  }

  update() {
    if (this.debugMode) {
      this.drawDebug();
    }

    if (this.gameOver) return;

    if (this.dropIndicator) {
      this.dropIndicator.clear();

      let targetY = this.containerHeight - Math.floor(WALL_THICKNESS / 2);

      for (const item of this.activeItems) {
        if (!item.active || !item.body) continue;
        const body = item.body as MatterJS.BodyType;
        const snackRadius = (item.width * item.scale * 0.5) || 20;

        const dx = Math.abs(body.position.x - this.pointerX);

        if (dx < snackRadius) {
          const dy = Math.sqrt(snackRadius * snackRadius - dx * dx);
          const hitY = body.position.y - dy;
          if (hitY < targetY && hitY > this.spawnY) {
            targetY = hitY;
          }
        }
      }

      this.dropIndicator.lineStyle(Math.max(2, Math.round(2 * this.scaleFactor)), 0xFFFFFF, 0.5);

      const dashLength = Math.round(8 * this.scaleFactor);
      const gapLength  = Math.round(8 * this.scaleFactor);
      const step = dashLength + gapLength;

      const timeOffset = (this.time.now / 30) % step;
      let currentY = this.spawnY + timeOffset - step;

      while (currentY < targetY) {
        const startY = Math.max(this.spawnY, currentY);
        const endY = Math.min(targetY, currentY + dashLength);
        if (startY < endY) {
          this.dropIndicator.lineBetween(this.pointerX, startY, this.pointerX, endY);
        }
        currentY += step;
      }

      if (this.previewSprite) {
        this.previewSprite.setX(this.pointerX);
        this.previewSprite.setVisible(!this.gameOver);
      }
    }

    this.checkGameOver();
  }

  private pickNextTier() {
    if (this.isFirstDrop) {
      this.nextTier = 0;
      this.isFirstDrop = false;
    } else {
      this.nextTier = Phaser.Math.Between(0, 2);
    }
  }

  private updatePreview() {
    const config = this.currentConfig[this.nextTier];
    if (this.previewSprite && config) {
      this.previewSprite.setTexture(config.textureKey);
      this.previewSprite.setDisplaySize(config.displaySize.width, config.displaySize.height);
    }

    const snack = this.snacks.find(s => s.tier === this.nextTier) || { tier: this.nextTier };
    EventBus.emit('next-item', snack);
  }

  public spawnFood(tier: number, x: number, y: number) {
    const config = this.currentConfig[tier];
    if (!config) return;

    const sprite = this.matter.add.sprite(x, y, config.textureKey);
    sprite.setDisplaySize(config.displaySize.width, config.displaySize.height);

    const customBody = ColliderFactory.createFoodBody(this, config, x, y);

    sprite.setExistingBody(customBody);
    (customBody as any).gameObject = sprite;
    
    if (config.colliderOptions.renderOrigin) {
      sprite.setOrigin(config.colliderOptions.renderOrigin.x, config.colliderOptions.renderOrigin.y);
    }

    sprite.setPosition(x, y);

    if (y < this.spawnY + 10) {
      this.activeItems.push(sprite);
    } else {
      this.activeItems.push(sprite);
    }
  }

  private getDropCooldown(): number {
    const q = this.npcQueueSize;
    if (q <= 0) return DROP_COOLDOWN_BASE;
    if (q === 1) return 1100;
    if (q === 2) return 1600;
    return DROP_COOLDOWN_MAX;
  }

  private dropSnack(x: number) {
    const droppedTier = this.nextTier;
    this.spawnFood(droppedTier, x, this.spawnY);

    EventBus.emit('food-revealed', { tier: droppedTier });

    this.lastDropTime = Date.now();
    this.canDrop = false;

    if (this.previewSprite) {
      this.previewSprite.setVisible(true);
      if (this.npcQueueSize > 0) {
        this.previewSprite.setTint(0x555555);
        this.previewSprite.setAlpha(0.4);
      } else {
        this.previewSprite.setAlpha(0.25);
      }
    }

    const cooldown = this.getDropCooldown();
    this.time.delayedCall(cooldown, () => {
      this.canDrop = true;
      if (this.previewSprite) {
        this.previewSprite.setAlpha(0.6);
        this.previewSprite.clearTint();
      }
    });

    this.pickNextTier();
    this.updatePreview();
    EventBus.emit('on-drop');
    EventBus.emit('drop-sfx');
  }

  private removeItem(item: Phaser.Physics.Matter.Sprite) {
    const idx = this.activeItems.indexOf(item);
    if (idx >= 0) this.activeItems.splice(idx, 1);
    if (item.body) {
      (item.body as any).gameObject = null;
    }
    item.destroy();
  }

  private checkGameOver() {
    if (this.gameOver || !this.matter.world.enabled) return;

    const DANGER_THRESHOLD_MS = 3000;
    const now = Date.now();

    const inDangerNow = new Set<number>();

    for (const item of this.activeItems) {
      if (!item.active || !item.body) continue;
      const body = item.body as MatterJS.BodyType;

      if (body.position.y <= this.spawnY + 5) continue;

      if (body.position.y < this.dangerLineY) {
        inDangerNow.add(body.id);

        if (!this.dangerTimers.has(body.id)) {
          this.dangerTimers.set(body.id, now);
        } else {
          const enteredAt = this.dangerTimers.get(body.id)!;
          if (now - enteredAt >= DANGER_THRESHOLD_MS) {
            this.gameOver = true;
            this.canDrop = false;
            this.matter.world.pause();
            this.dangerTimers.clear();
            EventBus.emit('game-over');
            return;
          }
        }
      }
    }

    for (const id of this.dangerTimers.keys()) {
      if (!inDangerNow.has(id)) {
        this.dangerTimers.delete(id);
      }
    }
  }

  private drawDebug() {
    this.debugGraphics.clear();

    const bodies = this.matter.world.getAllBodies();

    for (const body of bodies) {
      if (!body.label) continue;
      const config = this.currentConfig.find(f => f.name === body.label);
      if (!config) continue;

      switch (config.colliderType) {
        case 'circle':
          this.debugGraphics.lineStyle(2, 0x00ff00, 1);
          break;
        case 'polygon':
          this.debugGraphics.lineStyle(2, 0xffff00, 1);
          break;
        case 'fromVertices':
          this.debugGraphics.lineStyle(2, 0xff0000, 1);
          break;
        case 'rectangle':
          this.debugGraphics.lineStyle(2, 0x0000ff, 1);
          break;
      }

      if (body.vertices && body.vertices.length > 0) {
        this.debugGraphics.beginPath();
        for (const vertex of body.vertices) {
          this.debugGraphics.lineTo(vertex.x, vertex.y);
        }
        this.debugGraphics.lineTo(body.vertices[0].x, body.vertices[0].y);
        this.debugGraphics.strokePath();
      }
    }
  }

  private applyPushEffect(x: number, y: number, radius: number, force: number) {
    if (!this.matter || !this.matter.world) return;

    const bodies = this.matter.world.getAllBodies();

    bodies.forEach((body: any) => {
      if (!body || body.isStatic || !body.gameObject || !body.gameObject.active) return;

      const dx = body.position.x - x;
      const dy = body.position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0 && distance < radius) {
        const strength = (1 - distance / radius) * force;
        const pushX = (dx / distance) * strength;
        const pushY = (dy / distance) * strength;

        try {
          this.matter.body.applyForce(body, body.position, { x: pushX, y: pushY });
        } catch (e) {
          console.error("Failed to apply push force", e);
        }
      }
    });
  }
}
