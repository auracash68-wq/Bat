import Phaser from 'phaser';
import { AssetGenerator } from '../game/AssetGenerator';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  public create(): void {
    AssetGenerator.generateAll(this);
    this.scene.start('GameScene');
  }
}
