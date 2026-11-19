import Phaser from 'phaser';
import { PhysicsSystem } from '../systems/PhysicsSystem';
import { AudioManager } from '../managers/AudioManager';

export class Bird extends Phaser.GameObjects.Sprite {
  private velocityY: number = 0;
  private readonly hitRadius: number = 27; // Forgiving circular hitbox matching the rounded orange body
  private idleTime: number = 0;
  private startY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bird_1');
    this.startY = y;
    scene.add.existing(this);
    this.setDepth(30);
    this.setOrigin(0.5, 0.5);
    this.play('bird_fly');
  }

  public reset(x: number, y: number): void {
    this.setPosition(x, y);
    this.startY = y;
    this.velocityY = 0;
    this.idleTime = 0;
    this.setAngle(-6);
    this.play('bird_fly', true);
  }

  public updateIdle(dtSeconds: number): void {
    this.idleTime += dtSeconds;
    this.y = this.startY + Math.sin(this.idleTime * 4.2) * 12;
    this.setAngle(Math.sin(this.idleTime * 4.2) * 5 - 4);
  }

  public flap(): void {
    this.velocityY = PhysicsSystem.FLAP_VELOCITY;
    this.setAngle(PhysicsSystem.MIN_ANGLE);
    // Quick wing animation burst
    this.anims.timeScale = 1.65;
    AudioManager.getInstance().playFlap();
  }

  public updatePhysics(dtSeconds: number, ceilingLimit: number = 34): void {
    this.velocityY += PhysicsSystem.GRAVITY * dtSeconds;
    if (this.velocityY > PhysicsSystem.MAX_FALL_SPEED) {
      this.velocityY = PhysicsSystem.MAX_FALL_SPEED;
    }

    this.y += this.velocityY * dtSeconds;

    if (this.y < ceilingLimit) {
      this.y = ceilingLimit;
      if (this.velocityY < 0) {
        this.velocityY = 0;
      }
    }

    // Adjust wing flap speed based on rising vs gliding
    if (this.velocityY > 180) {
      this.anims.timeScale = 0.7;
    } else {
      this.anims.timeScale = 1.15;
    }

    const targetAngle = PhysicsSystem.computeRotation(this.velocityY);
    this.setAngle(Phaser.Math.Linear(this.angle, targetAngle, Math.min(1, dtSeconds * 14)));
  }

  public getHitRadius(): number {
    return this.hitRadius;
  }

  public getVelocityY(): number {
    return this.velocityY;
  }

  public stopAnimation(): void {
    this.stop();
  }
}
