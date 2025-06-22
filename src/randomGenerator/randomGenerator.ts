import { WorldPoint } from '../maps/mapModel/worldPoint';

/**
 * Represents a random number generator.
 */
export class RandomNumberGenerator {
  constructor(public seed: number) {}

  /**
   * Gets the current seed of the generator.
   *
   * @return The current seed.
   */
  public getCurrentSeed(): number {
    return this.seed;
  }

  /**
   * Sets a new seed for the generator.
   *
   * @param newSeed - The new seed value.
   */
  public setSeed(newSeed: number): void {
    this.seed = newSeed;
  }

  /**
   * Generates a random number.
   *
   * @return A random number between 0 and 1.
   */
  public generateRandomNumber(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    const rn = this.seed / 233280;
    return rn;
  }
}

/**
 * Represents a wrapper for a random number generator with additional utility methods.
 */
export class RandomNumberGeneratorBase extends RandomNumberGenerator {
  /**
   * Generates a random integer within the specified range, exclusive of the higher bound.
   *
   * If the higher bound is not specified, the lower bound is used and the range is 0 to lower.
   * If the lower bound is greater than the higher bound, the two are swapped.
   * The range is the difference between the higher and lower bounds, and a random
   * number between 0 and the range is generated. The result is the sum of the
   * random number and the lower bound, rounded down to the nearest whole number.
   *
   * @param lower - The lower bound of the range.
   * @param higher=0 - The higher bound of the range.
   * @return A random integer within the specified range, exclusive of the higher bound.
   */
  public randomIntegerExclusive(lower: number, higher: number = 0): number {
    if (!higher) {
      higher = lower;
      lower = 0;
    }
    if (lower > higher) {
      const swap = lower;
      lower = higher;
      higher = swap;
    }
    const range = higher - lower;
    const draw = this.generateRandomNumber() * range;
    const roll = Math.floor(draw) + lower;
    return roll;
  }

  /**
   * Generates a random integer within the specified range, inclusive of both bounds.
   *
   * @param lower - The lower bound of the range.
   * @param higher - The higher bound of the range.
   * @return A random integer within the specified range, inclusive of both the lower and higher bounds.
   */
  public randomIntegerInclusive(lower: number, higher: number): number {
    return this.randomIntegerExclusive(lower, higher + 1);
  }

  /**
   * Generates a random floating-point number within the specified range, inclusive of both bounds.
   *
   * The result is a number between the lower and higher bounds, inclusive of both.
   * The result is rounded to 2 decimal places.
   * If the lower bound is greater than the higher bound, the two are swapped.
   *
   * @param lower - The lower bound of the range.
   * @param higher - The higher bound of the range.
   * @return A random floating-point number within the specified range, inclusive of both the lower and higher bounds.
   */
  public randomFloatInclusive(lower: number, higher: number): number {
    if (lower > higher) {
      [lower, higher] = [higher, lower];
    }
    const draw = Math.random() * (higher - lower) + lower;
    return Math.round(draw * 100) / 100; // limit to 2 decimal places
  }

  /**
   * Checks if a random integer from 0 to N-1 equals 0.
   *
   * @param N - The number to check against.
   * @return True if a random integer from 0 to N-1 equals 0, otherwise false.
   */
  public isOneIn(N: number): boolean {
    return this.randomIntegerExclusive(N) == 0;
  }
}

/**
 * Represents a random generator extending the RandomNumberGeneratorWrapper class.
 */
export class RandomGenerator extends RandomNumberGeneratorBase {
  /**
   * Generates a random direction for forced movement. Never returns 0,0, to prevent returning the same world point the mob is currently at.
   *
   * @return A random direction represented as a WorldPoint object.
   */
  public randomDirectionForcedMovement(): WorldPoint {
    const a = this.randomIntegerInclusive(-1, 1);
    const b = this.isOneIn(2) ? 1 : -1;
    const h = this.isOneIn(2);
    return new WorldPoint(h ? a : b, h ? b : a);
  }

  /**
   * Generates a random WorldPoint representing a random direction.
   *
   * @return The randomly generated WorldPoint
   */
  public randomDirection0(): WorldPoint {
    return new WorldPoint(
      this.randomIntegerInclusive(-1, 1),
      this.randomIntegerInclusive(-1, 1),
    );
  }

  /**
   * Generates a new WorldPoint object representing a random direction from the given WorldPoint.
   *
   * @param p - (Optional) The starting WorldPoint. Defaults to a new WorldPoint.
   * @return A new WorldPoint object representing the random direction.
   */
  public randomDirection(p: WorldPoint = new WorldPoint()): WorldPoint {
    return new WorldPoint(
      p.x + this.randomIntegerInclusive(-1, 1),
      p.y + this.randomIntegerInclusive(-1, 1),
    );
  }

  /**
   * Increases the difficulty level by applying random adjustments.
   *
   * @param level - The current difficulty level.
   * @return The adjusted difficulty level.
   */
  public adjustLevel(level: number): number {
    if (this.isOneIn(3)) {
      const delta = this.isOneIn(3) ? -1 : 1;
      level = this.adjustLevelByDelta(level + delta, delta);

      if (level < 1) level = 0;
    }
    return level;
  }

  /**
   * Adjusts the level based on a random delta value.
   *
   * @param level - The current level.
   * @param delta - The adjustment delta.
   * @return The adjusted level.
   */
  public adjustLevelByDelta(level: number, delta: number): number {
    return this.isOneIn(4)
      ? this.adjustLevelByDelta(level + delta, delta)
      : level;
  }

  /**
   * Determines if a success event occurred based on the given rate.
   *
   * @param rate - The rate at which a success event occurs.
   * @return Returns true if a success event occurred, false otherwise.
   */
  public determineSuccess(rate: number): boolean {
    return this.randomIntegerExclusive(100) < rate;
  }

  /**
   * Retrieves a random image from the given array of strings.
   *
   * @param array - The array of strings from which to select a random image.
   * @return The randomly selected image from the array.
   */
  public getRandomImageFromArray(array: string[]): string {
    return array[this.randomIntegerInclusive(0, array.length - 1)];
  }
}
