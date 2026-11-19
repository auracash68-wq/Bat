import Phaser from 'phaser';
import { Bird } from '../entities/Bird';
import { ObstaclePair } from '../entities/Obstacle';

export class CollisionSystem {
  public static checkGroundOrCeiling(bird: Bird, groundTopY: number): 'ground' | 'ceiling' | null {
    const radius = bird.getHitRadius();
    if (bird.y + radius >= groundTopY) {
      return 'ground';
    }
    return null;
  }

  public static checkObstacleCollision(bird: Bird, pairs: ObstaclePair[]): boolean {
    const cx = bird.x;
    const cy = bird.y;
    const r = bird.getHitRadius();

    for (const pair of pairs) {
      if (!pair.active) continue;

      const topRect = pair.getTopHitbox();
      if (CollisionSystem.circleIntersectsRect(cx, cy, r, topRect)) {
        return true;
      }

      const bottomRect = pair.getBottomHitbox();
      if (CollisionSystem.circleIntersectsRect(cx, cy, r, bottomRect)) {
        return true;
      }
    }

    return false;
  }

  private static circleIntersectsRect(
    cx: number,
    cy: number,
    radius: number,
    rect: Phaser.Geom.Rectangle
  ): boolean {
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height));

    const dx = cx - closestX;
    const dy = cy - closestY;

    return dx * dx + dy * dy < radius * radius;
  }
}
