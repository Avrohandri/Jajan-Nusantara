import Phaser from 'phaser';
import type { SnackData } from '../../types';

export class SnackItem extends Phaser.GameObjects.Container {
  public tier: number;
  public snackData: SnackData;
  public matterBody: MatterJS.BodyType | null = null;
  public isDestroyed = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    snackData: SnackData,
    isStatic = false,
  ) {
    super(scene, x, y);
    this.tier = snackData.tier;
    this.snackData = snackData;

    const r = snackData.radius;

    // Draw circle
    const circle = scene.add.graphics();
    circle.fillStyle(Phaser.Display.Color.HexStringToColor(snackData.color).color, 1);
    circle.fillCircle(0, 0, r);
    // Border
    circle.lineStyle(2, 0xffffff, 0.6);
    circle.strokeCircle(0, 0, r);
    this.add(circle);

    // Emoji text
    const emoji = scene.add.text(0, -2, snackData.emoji, {
      fontSize: `${Math.max(r * 0.9, 14)}px`,
    }).setOrigin(0.5, 0.5);
    this.add(emoji);

    // Name label (small)
    const label = scene.add.text(0, r * 0.45, snackData.name, {
      fontSize: `${Math.max(r * 0.35, 8)}px`,
      color: '#ffffff',
      fontFamily: 'Nunito, sans-serif',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0.5);
    this.add(label);

    scene.add.existing(this);

    // Add Matter.js circular body
    const body = scene.matter.add.circle(x, y, r, {
      restitution: 0.2,
      friction: 0.5,
      frictionAir: 0.01,
      density: 0.001 * snackData.tier,
      isStatic,
      label: `snack_${snackData.tier}`,
    });
    this.matterBody = body;

    // Store reference to this container on the body
    (body as any).gameObject = this;
  }

  syncPosition() {
    if (this.matterBody && !this.isDestroyed) {
      this.setPosition(this.matterBody.position.x, this.matterBody.position.y);
    }
  }

  destroySnack() {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    if (this.matterBody) {
      this.scene.matter.world.remove(this.matterBody);
      (this.matterBody as any).gameObject = null;
    }
    this.destroy();
  }
}
