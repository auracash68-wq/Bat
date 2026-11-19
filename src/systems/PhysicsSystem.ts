export class PhysicsSystem {
  // Constants tuned for 1536x927 resolution
  public static readonly GRAVITY = 2150; // px/sec^2
  public static readonly FLAP_VELOCITY = -730; // px/sec upward impulse
  public static readonly MAX_FALL_SPEED = 980; // terminal velocity
  public static readonly MIN_ANGLE = -24; // degrees tilted up when flapping
  public static readonly MAX_ANGLE = 72; // degrees diving nose-down

  public static computeRotation(velocityY: number): number {
    if (velocityY < 0) {
      return PhysicsSystem.MIN_ANGLE;
    }
    // Smooth interpolation from -24 deg to +72 deg as fall speed increases
    const t = Math.min(1, Math.max(0, (velocityY - 80) / (PhysicsSystem.MAX_FALL_SPEED * 0.78)));
    return PhysicsSystem.MIN_ANGLE + t * (PhysicsSystem.MAX_ANGLE - PhysicsSystem.MIN_ANGLE);
  }
}
