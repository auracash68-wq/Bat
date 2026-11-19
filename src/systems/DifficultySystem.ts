export interface DifficultyConfig {
  scrollSpeed: number;
  gapHeight: number;
  horizontalSpacing: number;
}

export class DifficultySystem {
  private static readonly BASE_SPEED = 420; // px/sec
  private static readonly MAX_SPEED = 640; // px/sec
  private static readonly BASE_GAP = 258; // px vertical playable gap (matches reference proportion)
  private static readonly MIN_GAP = 198; // px at high score
  private static readonly BASE_SPACING = 540; // px horizontal distance between tree trunks
  private static readonly MIN_SPACING = 445;

  public static getConfigForScore(score: number): DifficultyConfig {
    // Progressive ramp every point up to score 50
    const progress = Math.min(1, score / 45);
    return {
      scrollSpeed: DifficultySystem.BASE_SPEED + progress * (DifficultySystem.MAX_SPEED - DifficultySystem.BASE_SPEED),
      gapHeight: Math.round(DifficultySystem.BASE_GAP - progress * (DifficultySystem.BASE_GAP - DifficultySystem.MIN_GAP)),
      horizontalSpacing: Math.round(
        DifficultySystem.BASE_SPACING - progress * (DifficultySystem.BASE_SPACING - DifficultySystem.MIN_SPACING)
      ),
    };
  }
}
