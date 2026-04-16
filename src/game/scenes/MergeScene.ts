import Phaser from 'phaser';
import { SnackItem } from '../objects/SnackItem';
import { EventBus } from '../EventBus';
import type { SnackData } from '../../types';

// === PENGATURAN TINGGI GARIS DEADLINE ===
// Ubah angka di bawah ini untuk menaikkan/menurunkan garis merah.
// Semakin BESAR angkanya, garis semakin ke BAWAH.
export const CONFIG_DANGER_LINE_Y = 170;

const WALL_THICKNESS = 30;
const DANGER_LINE_Y = CONFIG_DANGER_LINE_Y;
const DROP_COOLDOWN = 500; // ms
export const SPAWN_Y = 140; // Ganti tinggi spawn di sini

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

    // Draw visible walls (DINONAKTIFKAN agar bingkai murni dari CSS dan background terlihat full)
    // const wallGfx = this.add.graphics();
    // wallGfx.fillStyle(0xD4A373, 1);
    // wallGfx.fillRect(0, h - Math.floor(WALL_THICKNESS / 2), w, WALL_THICKNESS); // floor
    // wallGfx.fillRect(-Math.floor(WALL_THICKNESS / 2), 0, WALL_THICKNESS, h); // left
    // wallGfx.fillRect(w - Math.floor(WALL_THICKNESS / 2), 0, WALL_THICKNESS, h); // right

    // Danger line
    this.dangerLine = this.add.graphics();
    this.dangerLine.lineStyle(2, 0xff0000, 0.4);
    this.dangerLine.lineBetween(WALL_THICKNESS, DANGER_LINE_Y, w - WALL_THICKNESS, DANGER_LINE_Y);

    // Drop indicator line
    this.dropIndicator = this.add.graphics();

    // Arrow functions so we can remove them later
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
      // Destroy all items
      this.activeItems.forEach(item => item.destroySnack());
      this.activeItems = [];
      this.gameOver = false;
      this.canDrop = true;
      if (this.matter?.world) this.matter.world.resume();
      this.pickNextTier();
      this.updatePreview();
    };

    // Listen for events from React
    EventBus.on('set-snacks', onSetSnacks);
    EventBus.on('pause-game', onPause);
    EventBus.on('resume-game', onResume);
    EventBus.on('restart-game', onRestart);

    // Clean up listeners when scene is destroyed to prevent dead-scene errors
    this.events.once('destroy', () => {
      EventBus.off('set-snacks', onSetSnacks);
      EventBus.off('pause-game', onPause);
      EventBus.off('resume-game', onResume);
      EventBus.off('restart-game', onRestart);
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
    this.input.on('pointerup', () => {
      if (this.gameOver || !this.canDrop) return;
      // Removed y-restriction to allow dropping from anywhere
      // if (pointer.y > DANGER_LINE_Y + 40) return;

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
    if (this.dropIndicator) {
      this.dropIndicator.clear();

      // Cari titik pantul terjauh ke bawah (lantai atau jajanan lain)
      let targetY = this.containerHeight - Math.floor(WALL_THICKNESS / 2);

      for (const item of this.activeItems) {
        if (item.isDestroyed || !item.matterBody) continue;
        const body = item.matterBody;
        const snackRadius = item.snackData.radius;
        // Hitung jarak mendatar (X)
        const dx = Math.abs(body.position.x - this.pointerX);

        // Cek jika garis panduan menabrak lingkaran jajanan ini
        if (dx < snackRadius) {
          // Rumus Pythagoras untuk mencari titik potong Y pada lingkaran
          const dy = Math.sqrt(snackRadius * snackRadius - dx * dx);
          const hitY = body.position.y - dy;
          if (hitY < targetY && hitY > SPAWN_Y) {
            targetY = hitY;
          }
        }
      }

      this.dropIndicator.lineStyle(2, 0xFFFFFF, 0.5);

      // Gambar garis putus-putus yang bergerak (animasi)
      const dashLength = 8;
      const gapLength = 8;
      const step = dashLength + gapLength;

      // Waktu offset agar garis terlihat berjalan turun
      const timeOffset = (this.time.now / 30) % step;
      let currentY = SPAWN_Y + timeOffset - step;

      while (currentY < targetY) {
        const startY = Math.max(SPAWN_Y, currentY);
        const endY = Math.min(targetY, currentY + dashLength);
        if (startY < endY) {
          this.dropIndicator.lineBetween(this.pointerX, startY, this.pointerX, endY);
        }
        currentY += step;
      }

      // Show small preview circle at drop position
      const snack = this.snacks.find(s => s.tier === this.nextTier);
      if (snack) {
        this.dropIndicator.fillStyle(
          Phaser.Display.Color.HexStringToColor(snack.color).color, 0.4
        );
        this.dropIndicator.fillCircle(this.pointerX, SPAWN_Y, snack.radius);
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

    const item = new SnackItem(this, x, SPAWN_Y, snack);
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
    // 1. JANGAN cek game over jika sedang kuis/paused atau sudah game over
    if (this.gameOver || !this.matter.world.enabled || !this.canDrop) return;

    // 2. Beri waktu toleransi setelah drop agar jajanan punya waktu untuk jatuh
    if (Date.now() - this.lastDropTime < 2500) return;

    for (const item of this.activeItems) {
      if (item.isDestroyed || !item.matterBody) continue;
      const body = item.matterBody;

      const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);

      // 3. Jajanan dianggap melanggar deadline HANYA jika diam (speed rendah) 
      // dan posisinya di atas garis deadline (y < DANGER_LINE_Y)
      if (speed < 0.2 && body.position.y < DANGER_LINE_Y) {
        // Abaikan jika posisi Y masih di area start (y=SPAWN_Y)
        if (body.position.y <= SPAWN_Y + 5) continue;

        this.gameOver = true;
        this.canDrop = false;
        this.matter.world.pause();
        EventBus.emit('game-over');
        return;
      }
    }
  }
}
