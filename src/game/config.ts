import Phaser from 'phaser';
import { MergeScene } from './scenes/MergeScene';

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
    backgroundColor: '#FFF8F0',
    transparent: false,
    physics: {
      default: 'matter',
      matter: {
        gravity: { x: 0, y: 1.5 },
        debug: false,
      },
    },
    scene: [MergeScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
  };
}
