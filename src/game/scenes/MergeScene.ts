import Phaser from 'phaser';
import { SnackItem } from '../objects/SnackItem';
import { EventBus } from '../EventBus';
import type { SnackData } from '../../types';

const WALL_THICKNESS = 20;
const DANGER_LINE_Y = 80;
const DROP_COOLDOWN = 500; // ms

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
    this.pointerX = this.containerWidth / 2;

    // Build container walls
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

    // Draw visible walls
    const wallGfx = this.add.graphics();
    wallGfx.fillStyle(0xD4A373, 1);
    wallGfx.fillRect(0, h - WALL_THICKNESS / 2, w, WALL_THICKNESS); // floor
    wallGfx.fillRect(-WALL_THICKNESS / 2, 0, WALL_THICKNESS, h); // left
    wallGfx.fillRect(w - WALL_THICKNESS / 2, 0, WALL_THICKNESS, h); // right

    // Danger line
    this.dangerLine = this.add.graphics();
    this.dangerLine.lineStyle(2, 0xff0000, 0.4);
    this.dangerLine.lineBetween(WALL_THICKNESS, DANGER_LINE_Y, w - WALL_THICKNESS, DANGER_LINE_Y);

    // Drop indicator line
    this.dropIndicator = this.add.graphics();

    // Listen for events from React
    EventBus.on('set-snacks', (data: unknown) => {
      this.snacks = data as SnackData[];
      this.pickNextTier();
      this.updatePreview();
    });

    EventBus.on('pause-game', () => {
      this.matter.world.pause();
    });

    EventBus.on('resume-game', () => {
      if (!this.gameOver) {
        this.matter.world.resume();
      }
    });

    EventBus.on('restart-game', () => {
      // Destroy all items
      this.activeItems.forEach(item => item.destroySnack());
      this.activeItems = [];
      this.gameOver = false;
      this.canDrop = true;
      this.matter.world.resume();
      this.pickNextTier();
      this.updatePreview();
    });

    // Collision detection
    this.matter.world.on('collisionstart', (_event: any, bodyA: MatterJS.BodyType, bodyB: MatterJS.BodyType) => {
      if (this.gameOver) return;
      const itemA = (bodyA as any).gameObject as SnackItem | undefined;
      const itemB = (bodyB as any).gameObject as SnackItem | undefined;

      if (!itemA || !itemB) return;
      if (itemA.isDestroyed || itemB.isDestroyed) return;
      if (itemA.tier !== itemB.tier) return;

      // Find next tier
      const currentTier = itemA.tier;
      const nextSnack = this.snacks.find(s => s.tier === currentTier + 1);

      // Merge!
      const midX = (itemA.x + itemB.x) / 2;
      const midY = (itemA.y + itemB.y) / 2;

      // Destroy old
      this.removeItem(itemA);
      this.removeItem(itemB);

      if (nextSnack) {
        // Spawn merged item
        const merged = new SnackItem(this, midX, midY, nextSnack);
        this.activeItems.push(merged);

        EventBus.emit('on-merge', { tier: nextSnack.tier, points: nextSnack.points, name: nextSnack.name });
      } else {
        // Max tier reached — big points!
        EventBus.emit('on-merge', { tier: currentTier, points: 200, name: itemA.snackData.name });
      }
    });

    // Input — pointer move
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      this.pointerX = Phaser.Math.Clamp(
        pointer.x,
        WALL_THICKNESS + 30,
        this.containerWidth - WALL_THICKNESS - 30,
      );
    });

    // Input — drop on click/tap
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.gameOver || !this.canDrop) return;
      if (pointer.y > DANGER_LINE_Y + 40) return; // Only drop from top area

      const now = Date.now();
      if (now - this.lastDropTime < DROP_COOLDOWN) return;

      this.dropSnack(this.pointerX);
    });
  }

  update() {
    if (this.gameOver) return;

    // Sync all item positions
    for (const item of this.activeItems) {
      item.syncPosition();
    }

    // Update drop indicator
    if (this.dropIndicator && this.canDrop) {
      this.dropIndicator.clear();
      this.dropIndicator.lineStyle(2, 0xAAAAAA, 0.5);
      this.dropIndicator.lineBetween(this.pointerX, 10, this.pointerX, DANGER_LINE_Y);

      // Show small preview circle at drop position
      const snack = this.snacks.find(s => s.tier === this.nextTier);
      if (snack) {
        this.dropIndicator.fillStyle(
          Phaser.Display.Color.HexStringToColor(snack.color).color, 0.3
        );
        this.dropIndicator.fillCircle(this.pointerX, 30, snack.radius);
      }
    }

    // Check game over — any settled item above danger line
    this.checkGameOver();
  }

  private pickNextTier() {
    // Random from tier 1–3 (lower tiers only for dropping)
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
    // Emit to React for HUD preview
    EventBus.emit('next-item', snack);
  }

  private dropSnack(x: number) {
    const snack = this.snacks.find(s => s.tier === this.nextTier);
    if (!snack) return;

    const item = new SnackItem(this, x, 40, snack);
    this.activeItems.push(item);
    this.lastDropTime = Date.now();
    this.canDrop = false;

    // Cooldown before next drop
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
    // Wait at least 2 seconds after last drop
    if (Date.now() - this.lastDropTime < 2000) return;

    for (const item of this.activeItems) {
      if (item.isDestroyed || !item.matterBody) continue;
      const body = item.matterBody;
      // Check if body is settled (low velocity) and above danger line
      const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
      if (speed < 0.5 && body.position.y < DANGER_LINE_Y) {
        this.gameOver = true;
        this.canDrop = false;
        this.matter.world.pause();
        EventBus.emit('game-over');
        return;
      }
    }
  }
}
