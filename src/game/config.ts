import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { ColliderTestScene } from './scenes/ColliderTestScene';

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
export function createColliderTestConfig(
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
    backgroundColor: '#333333',
    physics: {
      default: 'matter',
      matter: {
        gravity: { x: 0, y: 0 }, // no gravity for testing
        debug: {
          showBody: true,
          showStaticBody: true,
          showBounds: true,
          showVelocity: false,
          showCollisions: true,
          showSeparation: false,
          showAxes: true,
          showPositions: true,
          showAngleIndicator: true,
        },
      },
    },
    scene: [ColliderTestScene],
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
