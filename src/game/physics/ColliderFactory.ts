import Phaser from 'phaser';
import type { FoodItem } from '../characters/FoodConfig';

// Membentuk body fisika (collider) untuk setiap jajanan sesuai bentuknya
export class ColliderFactory {
  // createFoodBody: buat bentuk tabrakan (hitbox) berdasarkan tipe collider di FoodConfig
  static createFoodBody(scene: Phaser.Scene, config: FoodItem, x: number, y: number): MatterJS.BodyType {
    const defaultOptions = {
      label: config.name,
      friction: 0.5,
      frictionAir: 0.01,
      restitution: 0.3, // Elastisitas pantulan
      density: 0.002,
      isStatic: false
    };

    let body: MatterJS.BodyType;

    switch (config.colliderType) {
      case 'circle': // Untuk jajanan bulat (misal: klepon, cenil)
        body = scene.matter.bodies.circle(x, y, config.colliderOptions.radius || 10, defaultOptions);
        break;
      case 'polygon': // Untuk jajanan bersisi banyak (jadah tempe)
        body = scene.matter.bodies.polygon(
          x,
          y,
          config.colliderOptions.sides || 8,
          config.colliderOptions.polyRadius || 32,
          defaultOptions
        );
        if (config.colliderOptions.angle) {
          scene.matter.body.setAngle(body, config.colliderOptions.angle);
        }
        break;
      case 'fromVertices': // Untuk jajanan dengan bentuk custom (dari titik-titik)
        const verts = config.colliderOptions.vertices || [];
        body = scene.matter.bodies.fromVertices(x, y, [verts], defaultOptions);
        break;
      case 'rectangle': // Untuk jajanan persegi (yangko, dll)
        body = scene.matter.bodies.rectangle(
          x,
          y,
          config.colliderOptions.width || 40,
          config.colliderOptions.height || 40,
          {
            ...defaultOptions,
            chamfer: config.colliderOptions.chamferRadius ? { radius: config.colliderOptions.chamferRadius } : undefined
          }
        );
        if (config.colliderOptions.angle) {
          scene.matter.body.setAngle(body, config.colliderOptions.angle);
        }
        break;
      default:
        body = scene.matter.bodies.circle(x, y, 10, defaultOptions);
    }

    return body;
  }
}
