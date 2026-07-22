import Phaser from 'phaser';
import { SnackItem } from '../objects/SnackItem';
import { EventBus } from '../EventBus';
import type { SnackData } from '../../types';


const WALL_THICKNESS = 30;
const DROP_COOLDOWN = 500;

export class MergeScene extends Phaser.Scene {
  private snacks: SnackData[] = [];
  private activeItems: SnackItem[] = [];
  private nextTier = 1;
  private canDrop = true;
  private lastDropTime = 0;
  private gameOver = false;
  private containerWidth = 0;
  private containerHeight = 0;
  private dropIndicator: Phaser.GameObjects.Graphics | null = null;
  private previewItem: Phaser.GameObjects.Container | null = null;
  private dangerLine: Phaser.GameObjects.Graphics | null = null;
  private pointerX = 0;
  private scaleFactor = 1.0;
  private dangerLineY = 170;
  private spawnY = 140;

  constructor() {
    super({ key: 'MergeScene' });
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

    this.dangerLineY = Math.round(this.containerHeight * 0.30);
    this.spawnY      = Math.round(this.containerHeight * 0.25);
    this.pointerX = this.containerWidth / 2;

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
    this.dangerLine.lineStyle(2, 0xff0000, 0.4);
    this.dangerLine.lineBetween(WALL_THICKNESS, this.dangerLineY, w - WALL_THICKNESS, this.dangerLineY);

    this.dropIndicator = this.add.graphics();

    const onSetSnacks = (data: unknown) => {
      const payload = data as { snacks: SnackData[]; scaleFactor: number };
      this.scaleFactor = payload.scaleFactor ?? 1.0;
      this.snacks = payload.snacks.map(s => ({
        ...s,
        radius: Math.round(s.radius * this.scaleFactor),
      }));
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
      this.activeItems.forEach(item => item.destroySnack());
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

    this.matter.world.on('collisionstart', (_event: any, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
      if (this.gameOver) return;
      const itemA = (bodyA as any).gameObject as SnackItem | undefined;
      const itemB = (bodyB as any).gameObject as SnackItem | undefined;

      if (!itemA || !itemB) return;
      if (itemA.isDestroyed || itemB.isDestroyed) return;
      if (itemA.tier !== itemB.tier) return;

      const currentTier = itemA.tier;
      const nextSnack = this.snacks.find(s => s.tier === currentTier + 1);

      const midX = (itemA.x + itemB.x) / 2;
      const midY = (itemA.y + itemB.y) / 2;

      this.removeItem(itemA);
      this.removeItem(itemB);

      if (nextSnack) {
        const merged = new SnackItem(this, midX, midY, nextSnack);
        this.activeItems.push(merged);

        EventBus.emit('on-merge', { tier: nextSnack.tier, points: nextSnack.points, name: nextSnack.name });
      } else {
        EventBus.emit('on-merge', { tier: currentTier, points: 200, name: itemA.snackData.name });
      }
    });

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
    if (this.gameOver) return;

    for (const item of this.activeItems) {
      item.syncPosition();
    }

    if (this.dropIndicator) {
      this.dropIndicator.clear();

      let targetY = this.containerHeight - Math.floor(WALL_THICKNESS / 2);

      for (const item of this.activeItems) {
        if (item.isDestroyed || !item.matterBody) continue;
        const body = item.matterBody;
        const snackRadius = item.snackData.radius;
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

      const snack = this.snacks.find(s => s.tier === this.nextTier);
      if (snack) {
        this.dropIndicator.fillStyle(
          Phaser.Display.Color.HexStringToColor(snack.color).color, 0.4
        );
        this.dropIndicator.fillCircle(this.pointerX, this.spawnY, snack.radius);
      }
    }

    this.checkGameOver();
  }

  private pickNextTier() {
    const maxDrop = Math.min(3, this.snacks.length);
    this.nextTier = Phaser.Math.Between(1, maxDrop);
  }

  private updatePreview() {
    if (this.previewItem) {
      this.previewItem.destroy();
      this.previewItem = null;
    }
    const snack = this.snacks.find(s => s.tier === this.nextTier);
    if (!snack) return;
    EventBus.emit('next-item', snack);
  }

  private dropSnack(x: number) {
    const snack = this.snacks.find(s => s.tier === this.nextTier);
    if (!snack) return;

    const item = new SnackItem(this, x, this.spawnY, snack);
    this.activeItems.push(item);
    this.lastDropTime = Date.now();
    this.canDrop = false;

    this.time.delayedCall(DROP_COOLDOWN, () => {
      this.canDrop = true;
    });

    this.pickNextTier();
    this.updatePreview();
    EventBus.emit('on-drop');
  }

  private removeItem(item: SnackItem) {
    const idx = this.activeItems.indexOf(item);
    if (idx >= 0) this.activeItems.splice(idx, 1);
    item.destroySnack();
  }

  private checkGameOver() {
    if (this.gameOver || !this.matter.world.enabled || !this.canDrop) return;

    if (Date.now() - this.lastDropTime < 2500) return;

    for (const item of this.activeItems) {
      if (item.isDestroyed || !item.matterBody) continue;
      const body = item.matterBody;

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
}
