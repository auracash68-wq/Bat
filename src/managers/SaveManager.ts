export interface SaveData {
  bestScore: number;
  totalFlights: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
}

const STORAGE_KEY = 'timber_wings_save_v1';

const DEFAULT_SAVE: SaveData = {
  bestScore: 0,
  totalFlights: 0,
  soundEnabled: true,
  musicEnabled: true,
};

export class SaveManager {
  private static data: SaveData = SaveManager.load();

  private static load(): SaveData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...DEFAULT_SAVE };
      const parsed = JSON.parse(raw);
      return {
        bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : 0,
        totalFlights: typeof parsed.totalFlights === 'number' ? parsed.totalFlights : 0,
        soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
        musicEnabled: typeof parsed.musicEnabled === 'boolean' ? parsed.musicEnabled : true,
      };
    } catch {
      return { ...DEFAULT_SAVE };
    }
  }

  private static persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SaveManager.data));
    } catch {
      // Ignore storage quota errors in restricted environments
    }
  }

  public static getData(): SaveData {
    return { ...SaveManager.data };
  }

  public static getBestScore(): number {
    return SaveManager.data.bestScore;
  }

  public static updateScore(score: number): boolean {
    let isNewRecord = false;
    if (score > SaveManager.data.bestScore) {
      SaveManager.data.bestScore = score;
      isNewRecord = true;
    }
    SaveManager.persist();
    return isNewRecord;
  }

  public static incrementFlights(): void {
    SaveManager.data.totalFlights += 1;
    SaveManager.persist();
  }

  public static setSoundEnabled(enabled: boolean): void {
    SaveManager.data.soundEnabled = enabled;
    SaveManager.persist();
  }

  public static setMusicEnabled(enabled: boolean): void {
    SaveManager.data.musicEnabled = enabled;
    SaveManager.persist();
  }
}
