import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';


export function createGameConfig(
  width: number,
  height: number,
  parent: string,
): Phaser.Types.Core.GameConfig {
  const dpr = window.devicePixelRatio || 1;
  return {
    type: Phaser.AUTO,
    width: width * dpr,
    height: height * dpr,
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
      width: width * dpr,
      height: height * dpr,
      zoom: 1 / dpr,
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
  };
}
