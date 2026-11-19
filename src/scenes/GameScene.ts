import Phaser from 'phaser';
import { Bird } from '../entities/Bird';
import { ObstaclePair } from '../entities/Obstacle';
import { CollisionSystem } from '../systems/CollisionSystem';
import { DifficultySystem } from '../systems/DifficultySystem';
import { ScoreSystem } from '../systems/ScoreSystem';
import { GameState, GameStateManager } from '../managers/GameStateManager';
import { AudioManager } from '../managers/AudioManager';
import { SaveManager } from '../managers/SaveManager';

export class GameScene extends Phaser.Scene {
  public static readonly SCENE_WIDTH = 1536;
  public static readonly SCENE_HEIGHT = 927;
  public static readonly GROUND_HEIGHT = 82;
  public static readonly GROUND_TOP_Y = GameScene.SCENE_HEIGHT - GameScene.GROUND_HEIGHT; // 845
  public static readonly BIRD_X = 540;
  public static readonly BIRD_START_Y = 610;

  private stateManager!: GameStateManager;
  private scoreSystem!: ScoreSystem;
  private bird!: Bird;

  // Parallax layers
  private mountainsLayer!: Phaser.GameObjects.TileSprite;
  private backForestLayer!: Phaser.GameObjects.TileSprite;
  private frontForestLayer!: Phaser.GameObjects.TileSprite;
  private bushesLayer!: Phaser.GameObjects.TileSprite;
  private groundLayer!: Phaser.GameObjects.TileSprite;

  // Pooled obstacles
  private obstaclePool: ObstaclePair[] = [];
  private lastGapCenterY: number = 460;

  // Particle emitter for flap puffs and collision feathers
  private featherParticles!: Phaser.GameObjects.Particles.ParticleEmitter;

  // Floating score popup pool
  private scorePopupText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'GameScene' });
  }

  public init(): void {
    const sharedState = this.registry.get('stateManager') as GameStateManager | undefined;
    if (sharedState) {
      this.stateManager = sharedState;
    } else {
      this.stateManager = new GameStateManager(SaveManager.getBestScore());
      this.registry.set('stateManager', this.stateManager);
    }
    this.scoreSystem = new ScoreSystem(this.stateManager);
  }

  public create(): void {
    const W = GameScene.SCENE_WIDTH;
    const groundY = GameScene.GROUND_TOP_Y;

    // 1. Sky background stretched cleanly across the 1536x845 sky area
    const sky = this.add.image(W / 2, groundY / 2, 'sky_bg');
    sky.setDisplaySize(W, groundY);
    sky.setDepth(1);

    // 2. Distant layered brown & muted-orange mountains
    this.mountainsLayer = this.add.tileSprite(W / 2, groundY - 60, W, 320, 'mountains_layer');
    this.mountainsLayer.setOrigin(0.5, 1);
    this.mountainsLayer.setDepth(3);

    // 3. Back dark-green pine forest layer
    this.backForestLayer = this.add.tileSprite(W / 2, groundY, W, 340, 'forest_back');
    this.backForestLayer.setOrigin(0.5, 1);
    this.backForestLayer.setDepth(5);

    // 4. Foreground bright-green cartoon pine forest layer
    this.frontForestLayer = this.add.tileSprite(W / 2, groundY, W, 360, 'forest_front');
    this.frontForestLayer.setOrigin(0.5, 1);
    this.frontForestLayer.setDepth(8);

    // 5. Low dark-green rounded bushes along the forest floor
    this.bushesLayer = this.add.tileSprite(W / 2, groundY + 2, W, 90, 'forest_bushes');
    this.bushesLayer.setOrigin(0.5, 1);
    this.bushesLayer.setDepth(22);

    // 6. Checkered brown soil ground with yellow-green grass top border
    this.groundLayer = this.add.tileSprite(
      W / 2,
      GameScene.SCENE_HEIGHT,
      W,
      GameScene.GROUND_HEIGHT,
      'ground_strip'
    );
    this.groundLayer.setOrigin(0.5, 1);
    this.groundLayer.setDepth(25);

    // 7. Initialize obstacle object pool (6 pairs cover entire 1536px width smoothly)
    this.obstaclePool = [];
    for (let i = 0; i < 6; i++) {
      this.obstaclePool.push(new ObstaclePair(this));
    }

    // 8. Create player bird
    this.bird = new Bird(this, GameScene.BIRD_X, GameScene.BIRD_START_Y);

    // 9. Feather particles for flap & collision feedback
    this.featherParticles = this.add.particles(0, 0, 'feather_particle', {
      speed: { min: 70, max: 240 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0.2 },
      alpha: { start: 1, end: 0 },
      lifespan: 480,
      gravityY: 400,
      emitting: false,
    });
    this.featherParticles.setDepth(35);

    // 10. Floating "+1" score popup in canvas
    this.scorePopupText = this.add.text(0, 0, '+1', {
      fontFamily: '"Bricolage Grotesque", sans-serif',
      fontSize: '42px',
      fontStyle: 'bold',
      color: '#fff6c5',
      stroke: '#331a08',
      strokeThickness: 7,
    });
    this.scorePopupText.setOrigin(0.5, 0.5);
    this.scorePopupText.setDepth(40);
    this.scorePopupText.setAlpha(0);

    // 11. Setup initial showcase scene in READY state matching the reference screenshot composition
    this.setupReadyPreviewObstacles();

    // 12. Input handling (Pointer / Touch + Keyboard)
    this.input.on('pointerdown', () => {
      this.handleActionInput();
    });

    if (this.input.keyboard) {
      this.input.keyboard.on('keydown-SPACE', (event: KeyboardEvent) => {
        event.preventDefault();
        this.handleActionInput();
      });

      this.input.keyboard.on('keydown-UP', (event: KeyboardEvent) => {
        event.preventDefault();
        this.handleActionInput();
      });

      this.input.keyboard.on('keydown-W', (event: KeyboardEvent) => {
        event.preventDefault();
        this.handleActionInput();
      });

      this.input.keyboard.on('keydown-ESC', () => {
        this.togglePause();
      });

      this.input.keyboard.on('keydown-P', () => {
        this.togglePause();
      });
    }

    // Pause automatically if browser tab loses visibility while playing
    this.game.events.on(Phaser.Core.Events.BLUR, () => {
      if (this.stateManager.getState() === GameState.PLAYING) {
        this.pauseGame();
      }
    });
  }

  /**
   * Positions wooden trunk obstacles in the READY background so the initial view
   * mirrors the attached reference gameplay screenshot before the player taps.
   */
  private setupReadyPreviewObstacles(): void {
    this.obstaclePool.forEach((p) => p.deactivate());
    // Left partial trunk, middle trunk pair around x=540, right trunk pair around x=1095
    this.obstaclePool[0].spawn(540, 610, 260);
    this.obstaclePool[1].spawn(1095, 165, 250);
    this.obstaclePool[2].spawn(1620, 390, 255);
    this.lastGapCenterY = 390;
  }

  public handleActionInput(): void {
    const state = this.stateManager.getState();
    if (state === GameState.READY) {
      this.startNewGame();
      this.bird.flap();
      this.emitFlapFeathers();
    } else if (state === GameState.PLAYING) {
      this.bird.flap();
      this.emitFlapFeathers();
    }
  }

  public startNewGame(): void {
    this.scoreSystem.reset();
    SaveManager.incrementFlights();
    this.bird.reset(GameScene.BIRD_X, GameScene.BIRD_START_Y);

    // Clear preview obstacles and spawn incoming ones ahead of the bird
    this.obstaclePool.forEach((p) => p.deactivate());
    const diff = DifficultySystem.getConfigForScore(0);

    let spawnX = 1120;
    this.lastGapCenterY = 480;
    for (let i = 0; i < 4; i++) {
      const gapY = this.computeNextFairGapY(diff.gapHeight);
      this.obstaclePool[i].spawn(spawnX, gapY, diff.gapHeight);
      spawnX += diff.horizontalSpacing;
    }

    this.stateManager.setState(GameState.PLAYING);
    AudioManager.getInstance().startMusic();
  }

  public restartGame(): void {
    this.stateManager.setState(GameState.RESTARTING);
    this.cameras.main.fadeOut(140, 28, 19, 11);
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.cameras.main.fadeIn(160, 28, 19, 11);
      this.startNewGame();
      this.bird.flap();
    });
  }

  public returnToHome(): void {
    this.scoreSystem.reset();
    this.bird.reset(GameScene.BIRD_X, GameScene.BIRD_START_Y);
    this.setupReadyPreviewObstacles();
    this.stateManager.setState(GameState.READY);
  }

  public pauseGame(): void {
    if (this.stateManager.getState() === GameState.PLAYING) {
      this.bird.stopAnimation();
      this.stateManager.setState(GameState.PAUSED);
    }
  }

  public resumeGame(): void {
    if (this.stateManager.getState() === GameState.PAUSED) {
      this.bird.play('bird_fly', true);
      this.stateManager.setState(GameState.PLAYING);
    }
  }

  public togglePause(): void {
    const state = this.stateManager.getState();
    if (state === GameState.PLAYING) {
      this.pauseGame();
    } else if (state === GameState.PAUSED) {
      this.resumeGame();
    }
  }

  private computeNextFairGapY(gapHeight: number): number {
    const minCenter = Math.max(155, gapHeight / 2 + 55);
    const maxCenter = Math.min(GameScene.GROUND_TOP_Y - 125, GameScene.GROUND_TOP_Y - gapHeight / 2 - 55);

    // Constrain maximum vertical jump between consecutive gaps so every pattern is fair & reachable
    const maxDelta = 235;
    const low = Math.max(minCenter, this.lastGapCenterY - maxDelta);
    const high = Math.min(maxCenter, this.lastGapCenterY + maxDelta);

    this.lastGapCenterY = Phaser.Math.Between(Math.round(low), Math.round(high));
    return this.lastGapCenterY;
  }

  private emitFlapFeathers(): void {
    this.featherParticles.emitParticleAt(this.bird.x - 22, this.bird.y + 8, 3);
  }

  private showScorePopup(): void {
    this.scorePopupText.setPosition(this.bird.x + 15, this.bird.y - 52);
    this.scorePopupText.setAlpha(1);
    this.scorePopupText.setScale(0.7);

    this.tweens.killTweensOf(this.scorePopupText);
    this.tweens.add({
      targets: this.scorePopupText,
      y: this.bird.y - 105,
      scale: 1.1,
      alpha: 0,
      duration: 520,
      ease: 'Cubic.easeOut',
    });
  }

  public update(_time: number, deltaMs: number): void {
    // Clamp delta to prevent large physics jumps after tab switching
    const dt = Math.min(deltaMs, 50) / 1000;
    const state = this.stateManager.getState();

    if (state === GameState.READY) {
      // Gentle atmospheric parallax drift on the Ready screen
      const idleSpeed = 55 * dt;
      this.mountainsLayer.tilePositionX += idleSpeed * 0.12;
      this.backForestLayer.tilePositionX += idleSpeed * 0.3;
      this.frontForestLayer.tilePositionX += idleSpeed * 0.55;
      this.bird.updateIdle(dt);
      return;
    }

    if (state !== GameState.PLAYING) {
      return;
    }

    const currentScore = this.scoreSystem.getScore();
    const diff = DifficultySystem.getConfigForScore(currentScore);
    const dx = diff.scrollSpeed * dt;

    // 1. Scroll multi-layer parallax environment
    this.mountainsLayer.tilePositionX += dx * 0.08;
    this.backForestLayer.tilePositionX += dx * 0.24;
    this.frontForestLayer.tilePositionX += dx * 0.46;
    this.bushesLayer.tilePositionX += dx * 0.88;
    this.groundLayer.tilePositionX += dx;

    // 2. Update bird physics
    this.bird.updatePhysics(dt);

    // 3. Scroll and recycle wooden tree-trunk obstacles
    let rightmostX = 0;
    for (const pair of this.obstaclePool) {
      if (pair.active && pair.x > rightmostX) {
        rightmostX = pair.x;
      }
    }

    for (const pair of this.obstaclePool) {
      if (!pair.active) continue;

      pair.updatePosition(dx);

      // Award 1 point when bird passes the center of the wooden trunk pair
      if (!pair.scored && pair.x + 20 < this.bird.x) {
        pair.scored = true;
        this.scoreSystem.incrementScore();
        this.showScorePopup();
      }

      // Recycle off-screen obstacle pair to the right
      if (pair.x < -ObstaclePair.TRUNK_WIDTH) {
        const nextX = Math.max(GameScene.SCENE_WIDTH + 140, rightmostX + diff.horizontalSpacing);
        const nextGapY = this.computeNextFairGapY(diff.gapHeight);
        pair.spawn(nextX, nextGapY, diff.gapHeight);
        rightmostX = nextX;
      }
    }

    // Ensure an inactive pooled pair spawns if needed
    for (const pair of this.obstaclePool) {
      if (!pair.active && rightmostX < GameScene.SCENE_WIDTH + diff.horizontalSpacing) {
        const nextX = rightmostX + diff.horizontalSpacing;
        const nextGapY = this.computeNextFairGapY(diff.gapHeight);
        pair.spawn(nextX, nextGapY, diff.gapHeight);
        rightmostX = nextX;
      }
    }

    // 4. Check collisions against wooden trunks or ground
    const groundHit = CollisionSystem.checkGroundOrCeiling(this.bird, GameScene.GROUND_TOP_Y);
    const trunkHit = CollisionSystem.checkObstacleCollision(this.bird, this.obstaclePool);

    if (groundHit === 'ground' || trunkHit) {
      this.handlePlayerCrash();
    }
  }

  private handlePlayerCrash(): void {
    this.bird.stopAnimation();
    this.featherParticles.emitParticleAt(this.bird.x, this.bird.y, 18);
    this.cameras.main.shake(190, 0.011);

    AudioManager.getInstance().playCollision();
    window.setTimeout(() => {
      AudioManager.getInstance().playGameOver();
    }, 160);

    this.stateManager.setState(GameState.GAME_OVER);
  }
}
