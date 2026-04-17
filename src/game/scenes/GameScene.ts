import Phaser from 'phaser';
import { REGION_FOOD_CONFIGS, REGION_FOOD_CONFIGS_RAW, scaleFoodConfig, type FoodItem } from '../characters/FoodConfig';
import { ColliderFactory } from '../physics/ColliderFactory';
import { EventBus } from '../EventBus';
import { useGameStore } from '../../store/gameStore';
import type { SnackData } from '../../types';

const WALL_THICKNESS = 30;
const DROP_COOLDOWN = 500; // ms

export class GameScene extends Phaser.Scene {
  private debugMode: boolean = false;
  private debugGraphics!: Phaser.GameObjects.Graphics;

  private snacks: SnackData[] = [];
  private activeItems: Phaser.Physics.Matter.Sprite[] = [];
  private nextTier = 0;
  private canDrop = true;
  private lastDropTime = 0;
  private gameOver = false;
  private containerWidth = 0;
  private containerHeight = 0;
  private dropIndicator: Phaser.GameObjects.Graphics | null = null;
  private previewSprite: Phaser.GameObjects.Sprite | null = null;
  private dangerLine: Phaser.GameObjects.Graphics | null = null;
  private pointerX = 0;

  private currentRegion: string = 'jogja';
  private currentConfig: FoodItem[] = [];

  // Computed in create() — proportional to canvas size (includes DPR)
  private scaleFactor = 1;
  private dangerLineY = 170;
  private spawnY = 140;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Determine current region
    this.currentRegion = useGameStore.getState().activeRegion || 'jogja';
    // currentConfig will be set in create() after we know containerHeight.
    // For preload, use the unscaled config just to get texture keys.
    const baseConfig = REGION_FOOD_CONFIGS[this.currentRegion] || REGION_FOOD_CONFIGS['jogja'];
    
    const assetFolder = `foods_${this.currentRegion}`;
    for (const item of baseConfig) {
      this.load.image(item.textureKey, `/assets/${assetFolder}/${item.textureKey}.png`);
    }
    // Store region for use in create()
    this.currentConfig = baseConfig;
  }

  init() {
    this.activeItems = [];
    this.gameOver = false;
    this.canDrop = true;
    this.lastDropTime = 0;
  }

  create() {
    this.containerWidth = Number(this.game.config.width);
    this.containerHeight = Number(this.game.config.height);
    this.pointerX = this.containerWidth / 2;

    // Baseline canvas is 560px tall at DPR=1 → containerHeight = 560.
    // On mobile DPR=3, containerHeight = 1680, so scaleFactor = 3.
    // Scale the ENTIRE config (displaySize + all collider dimensions) so
    // both sprite visual and physics body are proportional on all screens.
    this.scaleFactor  = this.containerHeight / 560;
    this.dangerLineY  = Math.round(this.containerHeight * 0.30);
    this.spawnY       = Math.round(this.containerHeight * 0.25);

    // Re-build scaled config — start from RAW and apply base 1.1 × DPR factor
    const rawConfig = REGION_FOOD_CONFIGS_RAW[this.currentRegion] || REGION_FOOD_CONFIGS_RAW['jogja'];
    this.currentConfig = scaleFoodConfig(rawConfig, 1.1 * this.scaleFactor);

    this.debugGraphics = this.add.graphics();
    this.debugGraphics.setDepth(100);

    const w = this.containerWidth;
    const h = this.containerHeight;

    // Floor
    this.matter.add.rectangle(w / 2, h, w, WALL_THICKNESS, {
      isStatic: true, label: 'wall',
      friction: 0.8,
    });
    // Left wall
    this.matter.add.rectangle(0, h / 2, WALL_THICKNESS, h, {
      isStatic: true, label: 'wall',
    });
    // Right wall
    this.matter.add.rectangle(w, h / 2, WALL_THICKNESS, h, {
      isStatic: true, label: 'wall',
    });

    // Danger line
    this.dangerLine = this.add.graphics();
    this.dangerLine.lineStyle(2, 0xff0000, 0.4);
    this.dangerLine.lineBetween(WALL_THICKNESS, this.dangerLineY, w - WALL_THICKNESS, this.dangerLineY);

    this.dropIndicator = this.add.graphics();
    const previewConfig = this.currentConfig[0];
    this.previewSprite = this.add.sprite(this.pointerX, this.spawnY, previewConfig.textureKey);
    this.previewSprite.setDisplaySize(previewConfig.displaySize.width, previewConfig.displaySize.height);
    this.previewSprite.setAlpha(0.6); // Semi-transparent preview
    this.previewSprite.setDepth(50); // Pastikan ada di atas indikator

    // Berikan hint langsung agar UI React tidak kosong
    this.time.delayedCall(100, () => {
      EventBus.emit('next-item', { tier: this.nextTier });
    });

    // Buat texture untuk partikel (lingkaran putih kecil)
    const pxGraphics = this.make.graphics({ x: 0, y: 0 }, false);
    pxGraphics.fillStyle(0xffffff, 1);
    pxGraphics.fillCircle(6, 6, 6);
    pxGraphics.generateTexture('particle_circle', 12, 12);
    pxGraphics.destroy();

    // Event hooks
    const onSetSnacks = (data: unknown) => {
      this.snacks = data as SnackData[];
      this.pickNextTier();
      this.updatePreview();
    };

    const onPause = () => {
      if (this.matter?.world) this.matter.world.pause();
    };

    const onResume = () => {
      if (this.matter?.world && !this.gameOver) {
        this.matter.world.resume();
      }
    };

    const onRestart = () => {
      this.activeItems.forEach(item => item.destroy());
      this.activeItems = [];
      this.gameOver = false;
      this.canDrop = true;
      if (this.matter?.world) this.matter.world.resume();
      this.pickNextTier();
      this.updatePreview();
    };

    EventBus.on('set-snacks', onSetSnacks);
    EventBus.on('pause-game', onPause);
    EventBus.on('resume-game', onResume);
    EventBus.on('restart-game', onRestart);

    this.events.once('destroy', () => {
      EventBus.off('set-snacks', onSetSnacks);
      EventBus.off('pause-game', onPause);
      EventBus.off('resume-game', onResume);
      EventBus.off('restart-game', onRestart);
    });

    this.input.keyboard?.on('keydown-D', () => {
      this.debugMode = !this.debugMode;
      if (!this.debugMode) {
        this.debugGraphics.clear();
      }
    });

    // Merge system
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

        const configA = this.currentConfig.find(f => f.name === bodyA.label);
        if (!configA) continue;

        if (bodyA.label === bodyB.label) {
          const tier = configA.tier;

          const midX = (bodyA.position.x + bodyB.position.x) / 2;
          const midY = (bodyA.position.y + bodyB.position.y) / 2;

          this.removeItem(objA);
          this.removeItem(objB);

          // Particles Effect
          const particles = this.add.particles(midX, midY, 'particle_circle', {
            speed: { min: 60, max: 180 },
            scale: { start: 1, end: 0 },
            alpha: { start: 1, end: 0 },
            lifespan: 700,
            quantity: 15,
            blendMode: 'NORMAL',
            tint: configA.color
          });
          particles.explode(15);
          this.time.delayedCall(1000, () => particles.destroy());

          // Push Effect to nearby items (Ditingkatkan kekuatan dorongnya)
          this.applyPushEffect(midX, midY, 180, 0.25);

          if (tier < this.currentConfig.length - 1) {
            const nextTier = tier + 1;
            const configNext = this.currentConfig[nextTier];
            const pts = configNext ? configNext.mergeScore : 10;
            const nm = configNext ? configNext.name : 'Unknown';

            this.time.delayedCall(50, () => {
              this.spawnFood(nextTier, midX, midY);
              EventBus.emit('on-merge', { tier: nextTier, points: pts, name: nm });
            });
          } else {
            EventBus.emit('on-merge', { tier, points: 200, name: configA.name });
          }
        }
      }
    };

    this.matter.world.on('collisionstart', handleMergeCollision);
    this.matter.world.on('collisionactive', handleMergeCollision);

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.pointerX = Phaser.Math.Clamp(
        pointer.x,
        WALL_THICKNESS + 30,
        this.containerWidth - WALL_THICKNESS - 30,
      );
    });

    this.input.on('pointerup', () => {
      if (this.gameOver || !this.canDrop) return;

      const now = Date.now();
      if (now - this.lastDropTime < DROP_COOLDOWN) return;

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

      this.dropIndicator.lineStyle(2, 0xFFFFFF, 0.5);

      const dashLength = 8;
      const gapLength = 8;
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
        this.previewSprite.setVisible(this.canDrop && !this.gameOver);
      }
    }

    this.checkGameOver();
  }

  private pickNextTier() {
    this.nextTier = Phaser.Math.Between(0, 2);
  }

  private updatePreview() {
    // Selalu update preview sprite dalam engine (tidak bergantung pada react store array)
    const config = this.currentConfig[this.nextTier];
    if (this.previewSprite && config) {
      this.previewSprite.setTexture(config.textureKey);
      this.previewSprite.setDisplaySize(config.displaySize.width, config.displaySize.height);
    }

    // Update HUD React jika ada tipe
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

  private dropSnack(x: number) {
    this.spawnFood(this.nextTier, x, this.spawnY);

    this.lastDropTime = Date.now();
    this.canDrop = false;
    if (this.previewSprite) this.previewSprite.setVisible(false);

    this.time.delayedCall(DROP_COOLDOWN, () => {
      this.canDrop = true;
      if (this.previewSprite) this.previewSprite.setVisible(true);
    });

    this.pickNextTier();
    this.updatePreview();
    EventBus.emit('on-drop');
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
    if (this.gameOver || !this.matter.world.enabled || !this.canDrop) return;
    if (Date.now() - this.lastDropTime < 2500) return;

    for (const item of this.activeItems) {
      if (!item.active || !item.body) continue;
      const body = item.body as MatterJS.BodyType;

      const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);

      if (speed < 0.2 && body.position.y < this.dangerLineY) {
        if (body.position.y <= this.spawnY + 5) continue;

        this.gameOver = true;
        this.canDrop = false;
        this.matter.world.pause();
        EventBus.emit('game-over');
        return;
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
          this.debugGraphics.lineStyle(2, 0x0000ff, 1); // Biru untuk rectangle
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

    // Gunakan getAllBodies() untuk menghindari error query method yang mungkin tidak di-support dan menyebabkan freeze
    const bodies = this.matter.world.getAllBodies();

    bodies.forEach((body: any) => {
      if (!body || body.isStatic || !body.gameObject || !body.gameObject.active) return;

      const dx = body.position.x - x;
      const dy = body.position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0 && distance < radius) {
        // Semakin dekat, semakin kuat dorongannya
        const strength = (1 - distance / radius) * force;
        const pushX = (dx / distance) * strength;
        const pushY = (dy / distance) * strength;

        // Terapkan force
        try {
          this.matter.body.applyForce(body, body.position, { x: pushX, y: pushY });
        } catch (e) {
          console.error("Failed to apply push force", e);
        }
      }
    });
  }
}
