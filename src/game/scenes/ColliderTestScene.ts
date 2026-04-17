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
      const assetFolder = `foods_${region}`;
      for (const item of configArray) {
        this.load.image(item.textureKey, `/assets/${assetFolder}/${item.textureKey}.png`);
      }
    }
  }

  private activeItems: Phaser.GameObjects.Sprite[] = [];
  private regionTitle!: Phaser.GameObjects.Text;

  create() {
    const width = Number(this.game.config.width);
    const height = Number(this.game.config.height);

    // Title
    this.regionTitle = this.add.text(width / 2, 40, 'Collider Test Mode', {
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

    import('../EventBus').then(({ EventBus }) => {
      EventBus.on('collider-change-region', (region) => this.spawnRegion(region as string));
      // Read initial region parameter passed via url or fallback to 'jogja'
      // Or we can just wait for the component to emit the default on mount.
      // We will init with 'jogja'
      this.spawnRegion('jogja');
    });
  }

  private spawnRegion(region: string) {
    const width = Number(this.game.config.width);
    
    // Clear existing
    this.activeItems.forEach(item => {
      if (item.body) this.matter.world.remove(item.body);
      item.destroy();
    });
    this.activeItems = [];

    this.regionTitle.setText(`Collider Test Mode: ${region.toUpperCase()}`);

    const configArray = REGION_FOOD_CONFIGS[region];
    if (!configArray) return;

    let startX = 60;
    let startY = 120;
    
    for (const item of configArray) {
      const sprite = this.matter.add.sprite(startX, startY, item.textureKey);
      sprite.setDisplaySize(item.displaySize.width, item.displaySize.height);

      const customBody = ColliderFactory.createFoodBody(this, item, startX, startY);
      sprite.setExistingBody(customBody);
      
      if (item.colliderOptions.renderOrigin) {
        sprite.setOrigin(item.colliderOptions.renderOrigin.x, item.colliderOptions.renderOrigin.y);
      }
      
      sprite.setPosition(startX, startY);
      this.matter.add.mouseSpring({ length: 1, stiffness: 0.6 });
      
      this.activeItems.push(sprite);

      startX += 80;
      if (startX > width - 60) {
        startX = 60;
        startY += 100;
      }
    }
  }
}

