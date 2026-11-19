import { SaveManager } from '../managers/SaveManager';
import { GameStateManager } from '../managers/GameStateManager';
import { AudioManager } from '../managers/AudioManager';

export class ScoreSystem {
  private score: number = 0;
  private stateManager: GameStateManager;

  constructor(stateManager: GameStateManager) {
    this.stateManager = stateManager;
  }

  public reset(): void {
    this.score = 0;
    const best = SaveManager.getBestScore();
    this.stateManager.resetSession(best);
  }

  public incrementScore(): number {
    this.score += 1;
    const isNewRecord = SaveManager.updateScore(this.score);
    const best = SaveManager.getBestScore();
    this.stateManager.setScore(this.score, best, isNewRecord);
    AudioManager.getInstance().playScore();
    return this.score;
  }

  public getScore(): number {
    return this.score;
  }
}
