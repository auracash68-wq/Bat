export enum GameState {
  READY = 'READY',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  RESTARTING = 'RESTARTING',
}

type StateListener = (state: GameState, score: number, bestScore: number, isNewRecord: boolean) => void;

export class GameStateManager {
  private currentState: GameState = GameState.READY;
  private score: number = 0;
  private bestScore: number = 0;
  private isNewRecord: boolean = false;
  private listeners: Set<StateListener> = new Set();

  constructor(initialBestScore: number) {
    this.bestScore = initialBestScore;
  }

  public getState(): GameState {
    return this.currentState;
  }

  public getScore(): number {
    return this.score;
  }

  public getBestScore(): number {
    return this.bestScore;
  }

  public getIsNewRecord(): boolean {
    return this.isNewRecord;
  }

  public setState(nextState: GameState): void {
    this.currentState = nextState;
    this.notify();
  }

  public setScore(score: number, bestScore: number, isNewRecord: boolean): void {
    this.score = score;
    this.bestScore = bestScore;
    if (isNewRecord) {
      this.isNewRecord = true;
    }
    this.notify();
  }

  public resetSession(bestScore: number): void {
    this.score = 0;
    this.bestScore = bestScore;
    this.isNewRecord = false;
    this.notify();
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.currentState, this.score, this.bestScore, this.isNewRecord);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => {
      listener(this.currentState, this.score, this.bestScore, this.isNewRecord);
    });
  }
}
