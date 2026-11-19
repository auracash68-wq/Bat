import Phaser from 'phaser';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { GameScene } from '../scenes/GameScene';
import { GameStateManager } from '../managers/GameStateManager';

export function createPhaserGame(
  parentContainer: HTMLElement,
  stateManager: GameStateManager
): Phaser.Game {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: parentContainer,
    width: GameScene.SCENE_WIDTH,
    height: GameScene.SCENE_HEIGHT,
    backgroundColor: '#6dc379',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
    scene: [BootScene, PreloadScene, GameScene],
    callbacks: {
      preBoot: (game) => {
        game.registry.set('stateManager', stateManager);
      },
    },
  };

  return new Phaser.Game(config);
}
