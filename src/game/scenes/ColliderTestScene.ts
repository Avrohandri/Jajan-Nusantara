import Phaser from 'phaser';
import { REGION_FOOD_CONFIGS } from '../characters/FoodConfig';
import { ColliderFactory } from '../physics/ColliderFactory';

export class ColliderTestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ColliderTestScene' });
  }

  preload() {
    // Load ALL regions' food
    for (const [region, configArray] of Object.entries(REGION_FOOD_CONFIGS)) {
      const assetFolder = region === 'jogja' ? 'foods' : `foods_${region}`;
      for (const item of configArray) {
        this.load.image(item.textureKey, `/assets/${assetFolder}/${item.textureKey}.png`);
      }
    }
  }

  create() {
    const width = Number(this.game.config.width);
    const height = Number(this.game.config.height);

    // Title
    this.add.text(width / 2, 40, 'Collider Test Mode', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, 70, 'Drag and drop items to test physics.', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // Add boundaries so they don't fall off
    this.matter.add.rectangle(width / 2, height, width, 50, { isStatic: true });
    this.matter.add.rectangle(0, height / 2, 50, height, { isStatic: true });
    this.matter.add.rectangle(width, height / 2, 50, height, { isStatic: true });

    let startX = 60;
    let startY = 120;
    
    // Spawn all items
    for (const configArray of Object.values(REGION_FOOD_CONFIGS)) {
      for (const item of configArray) {
        const sprite = this.matter.add.sprite(startX, startY, item.textureKey);
        sprite.setDisplaySize(item.displaySize.width, item.displaySize.height);

        const customBody = ColliderFactory.createFoodBody(this, item, startX, startY);
        sprite.setExistingBody(customBody);
        
        // Phaser's fromVertices sets origin to match center of mass.
        // We will leave it standard as in GameScene.ts so we test actual game-behavior.
        
        sprite.setPosition(startX, startY);
        this.matter.add.mouseSpring({ length: 1, stiffness: 0.6 });

        startX += 80;
        if (startX > width - 60) {
          startX = 60;
          startY += 100;
        }
      }
    }
  }
}
