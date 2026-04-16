import Phaser from 'phaser';
import type { FoodItem } from '../characters/FoodConfig';

export class ColliderFactory {
  static createFoodBody(scene: Phaser.Scene, config: FoodItem, x: number, y: number): MatterJS.BodyType {
    const defaultOptions = {
      label: config.name,
      friction: 0.5,
      frictionAir: 0.01,
      restitution: 0.3,
      density: 0.002,
      isStatic: false
    };

    let body: MatterJS.BodyType;

    // Gunakan scene.matter.bodies untuk MENGHASILKAN definisi body-nya saja,
    // (Bukan otomatis di map/ditempatkan ke world seperti scene.matter.add)
    // agar bisa di attach secara aman ke setExistingBody().
    switch (config.colliderType) {
      case 'circle':
        body = scene.matter.bodies.circle(x, y, config.colliderOptions.radius || 10, defaultOptions);
        break;
      case 'polygon':
        body = scene.matter.bodies.polygon(
          x, 
          y, 
          config.colliderOptions.sides || 8, 
          config.colliderOptions.polyRadius || 32, 
          defaultOptions
        );
        break;
      case 'fromVertices':
        // fromVertices expects an array of vertex arrays (Vector[][])
        const verts = config.colliderOptions.vertices || [];
        body = scene.matter.bodies.fromVertices(x, y, [verts], defaultOptions);
        break;
      case 'rectangle':
        body = scene.matter.bodies.rectangle(
          x, 
          y, 
          config.colliderOptions.width || 40, 
          config.colliderOptions.height || 40, 
          defaultOptions
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
