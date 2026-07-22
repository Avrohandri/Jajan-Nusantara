import Phaser from 'phaser';
import { REGION_FOOD_CONFIGS, REGION_FOOD_CONFIGS_RAW, scaleFoodConfig } from '../characters/FoodConfig';
import { ColliderFactory } from '../physics/ColliderFactory';

export class ColliderTestScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ColliderTestScene' });
  }

  preload() {
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
    const width  = Number(this.game.config.width);
    const height = Number(this.game.config.height);
    const scaleFactor = height / 560;
    const fontSize = Math.round(24 * scaleFactor);
    const subFontSize = Math.round(14 * scaleFactor);

    this.regionTitle = this.add.text(width / 2, Math.round(40 * scaleFactor), 'Collider Test Mode', {
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, Math.round(70 * scaleFactor), 'Drag and drop items to test physics.', {
      fontSize: `${subFontSize}px`,
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.matter.add.rectangle(width / 2, height, width, 50, { isStatic: true });
    this.matter.add.rectangle(0, height / 2, 50, height, { isStatic: true });
    this.matter.add.rectangle(width, height / 2, 50, height, { isStatic: true });

    import('../EventBus').then(({ EventBus }) => {
      EventBus.on('collider-change-region', (region) => this.spawnRegion(region as string));
      this.spawnRegion('jogja');
    });
  }

  private spawnRegion(region: string) {
    const width  = Number(this.game.config.width);
    const height = Number(this.game.config.height);
    const scaleFactor = height / 560;
    
    this.activeItems.forEach(item => {
      if (item.body) this.matter.world.remove(item.body);
      item.destroy();
    });
    this.activeItems = [];

    this.regionTitle.setText(`Collider Test Mode: ${region.toUpperCase()}`);

    const rawConfig = REGION_FOOD_CONFIGS_RAW[region];
    if (!rawConfig) return;
    const configArray = scaleFoodConfig(rawConfig, 1.1 * scaleFactor);

    let startX = Math.round(60 * scaleFactor);
    let startY = Math.round(120 * scaleFactor);
    const stepX = Math.round(80 * scaleFactor);
    const stepY = Math.round(100 * scaleFactor);
    
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

      startX += stepX;
      if (startX > width - Math.round(60 * scaleFactor)) {
        startX = Math.round(60 * scaleFactor);
        startY += stepY;
      }
    }
  }
}

