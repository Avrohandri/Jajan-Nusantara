import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

export function createGameConfig(
  width: number,
  height: number,
  parent: string,
): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    width,
    height,
    parent,
    backgroundColor: 'transparent',
    transparent: true,
    physics: {
      default: 'matter',
      matter: {
        gravity: { x: 0, y: 1.5 },
        debug: false,
      },
    },
    scene: [GameScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };
}
