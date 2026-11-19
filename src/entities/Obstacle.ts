import Phaser from 'phaser';

export class ObstaclePair {
  public x: number = 0;
  public gapCenterY: number = 0;
  public gapHeight: number = 250;
  public scored: boolean = false;
  public active: boolean = false;

  private topSprite: Phaser.GameObjects.Image;
  private bottomSprite: Phaser.GameObjects.Image;

  // Trunk dimensions matching the reference screenshot (approx 196px wide)
  public static readonly TRUNK_WIDTH = 196;
  public static readonly HITBOX_WIDTH = 174; // Slightly inset from outer bark notches for fair feel
  public static readonly TRUNK_HEIGHT = 760;

  constructor(scene: Phaser.Scene) {
    this.topSprite = scene.add.image(-500, -500, 'wood_trunk_top');
    this.topSprite.setOrigin(0.5, 1); // Anchor at bottom cut face of the top hanging log
    this.topSprite.setDepth(20);
    this.topSprite.setVisible(false);

    this.bottomSprite = scene.add.image(-500, -500, 'wood_trunk_bottom');
    this.bottomSprite.setOrigin(0.5, 0); // Anchor at top cut face of the bottom standing log
    this.bottomSprite.setDepth(20);
    this.bottomSprite.setVisible(false);
  }

  public spawn(x: number, gapCenterY: number, gapHeight: number): void {
    this.x = x;
    this.gapCenterY = gapCenterY;
    this.gapHeight = gapHeight;
    this.scored = false;
    this.active = true;

    const topBottomY = gapCenterY - gapHeight / 2;
    const bottomTopY = gapCenterY + gapHeight / 2;

    this.topSprite.setPosition(x, topBottomY);
    this.topSprite.setVisible(true);

    this.bottomSprite.setPosition(x, bottomTopY);
    this.bottomSprite.setVisible(true);
  }

  public updatePosition(dx: number): void {
    if (!this.active) return;
    this.x -= dx;
    this.topSprite.x = this.x;
    this.bottomSprite.x = this.x;
  }

  public deactivate(): void {
    this.active = false;
    this.topSprite.setVisible(false);
    this.bottomSprite.setVisible(false);
  }

  public getTopHitbox(): Phaser.Geom.Rectangle {
    const topBottomY = this.gapCenterY - this.gapHeight / 2;
    return new Phaser.Geom.Rectangle(
      this.x - ObstaclePair.HITBOX_WIDTH / 2,
      topBottomY - ObstaclePair.TRUNK_HEIGHT,
      ObstaclePair.HITBOX_WIDTH,
      ObstaclePair.TRUNK_HEIGHT - 6
    );
  }

  public getBottomHitbox(): Phaser.Geom.Rectangle {
    const bottomTopY = this.gapCenterY + this.gapHeight / 2;
    return new Phaser.Geom.Rectangle(
      this.x - ObstaclePair.HITBOX_WIDTH / 2,
      bottomTopY + 6,
      ObstaclePair.HITBOX_WIDTH,
      ObstaclePair.TRUNK_HEIGHT
    );
  }
}
