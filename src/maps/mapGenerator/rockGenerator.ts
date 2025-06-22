import { Glyph } from '../../gameLogic/glyphs/glyph';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { Rock } from '../../types/gameLogic/maps/mapGenerator/rock';
import { Tile } from '../../types/gameLogic/maps/mapGenerator/tile';

/**
 * Class for generating different rock types.
 */
export class RockGenerator {
  public static getWallRockTypes(rand: RandomGenerator, tile: Tile): Glyph {
    return this.getRandomGlyph(rand, tile.wall);
  }

  /**
   * Retrieves the floor rock types randomly based on the given random generator and tile.
   *
   * @param rand - The random generator used to generate the random selection.
   * @param tile - The tile object containing the floor information.
   * @return The randomly selected glyph.
   */
  public static getFloorRockTypes(rand: RandomGenerator, tile: Tile): Glyph {
    return this.getRandomGlyph(rand, tile.floor);
  }

  /**
   * Given a list of rock types and their relative weights, this function returns a Glyph
   * based on the weights. The function will throw an error if the total weight of the
   * rock types is less than or equal to zero.
   *
   * @param rand - The random generator used to generate a random number.
   * @param rockTypes - The array of rock types with their relative weights.
   * @return The glyph of the selected rock type.
   */
  private static getRandomGlyph(
    rand: RandomGenerator,
    rockTypes: Rock[],
  ): Glyph {
    const totalWeight = rockTypes.reduce(
      (sum, rt) => sum + rt.relativeWeight,
      0,
    );

    if (totalWeight <= 0) {
      // Handle the case where there are no valid types or all weights are zero
      console.warn(
        'No valid rock types or total weight is zero. Returning default.',
      );
      return Glyph.Regular_Floor;
    }

    // Generate a random number between 0  and totalWeight
    const randNum = rand.generateRandomNumber() * totalWeight;

    let accumulatedWeight = 0;
    for (const rockType of rockTypes) {
      accumulatedWeight += rockType.relativeWeight; // Use relativeWeight
      if (randNum < accumulatedWeight) {
        return rockType.glyph;
      }
    }

    //  Return the last element as a fallback
    if (rockTypes.length > 0) {
      return rockTypes[rockTypes.length - 1].glyph;
    }

    // If the rockTypes array is empty or otherwise invalid
    throw new Error(
      'Unable to select a rock glyph. Check the rock types and their weights.',
    );
  }
}
