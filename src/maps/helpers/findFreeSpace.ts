import { GameMapType } from '../../shared-types/gameLogic/maps/mapModel/gameMapType';
import { Glyph } from '../../gameLogic/glyphs/glyph';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Utility class for finding an unoccupied space on a map.
 */
export class FindFreeSpace {
  /**
   * Finds a free space on the map.
   *
   * @param map - The map on which to find free space.
   * @param rand - The random generator to use for finding free space.
   * @return A WorldPoint representing the free space found, or null if no free space is available.
   */
  public static findFree(map: GameMapType, rand: RandomGenerator): WorldPoint {
    return this.find(Glyph.Regular_Floor, map, rand);
  }

  /**
   * Finds a specified character in the map and returns its position.
   *
   * @param char - The character to find.
   * @param map - The map in which to search for the character.
   * @param rand - The random generator to use for finding the character.
   * @return A WorldPoint representing the position of the character found.
   * @throw Throws an error if no free space is found.
   */
  public static find(
    char: Glyph,
    map: GameMapType,
    rand: RandomGenerator,
  ): WorldPoint {
    const e = new WorldPoint(map.dimensions.x - 2, map.dimensions.y - 2);
    const s = new WorldPoint(
      rand.randomIntegerInclusive(1, e.x),
      rand.randomIntegerInclusive(1, e.y),
    );
    for (let p = s.copy(); ; ) {
      const cell = map.cell(p);
      if (cell.env === char && !cell.mob) {
        return p;
      }
      ++p.x;
      if (p.x > e.x) {
        p.x = 1;
        ++p.y;
        if (p.y > e.y) {
          p.y = 1;
        }
        if (p.isEqual(s)) {
          throw 'No free space found';
        }
      }
    }
  }

  /**
   * Finds a free space adjacent to a provided world point.
   * If no space is found, it increases the search radius and retries.
   *
   * @param point - The point around which to search for free space.
   * @param map - The map on which to find free space.
   * @param maxRadius - The maximum radius within which to search for free space.
   * @return A WorldPoint representing the free adjacent space found, or null if no free space is available.
   */
  public static findFreeAdjacent(
    point: WorldPoint,
    map: GameMapType,
    maxRadius: number,
  ): WorldPoint | null {
    let radius = 1;

    while (radius <= maxRadius) {
      for (let x = -radius; x <= radius; x++) {
        for (let y = -radius; y <= radius; y++) {
          if (x === 0 && y === 0) continue;

          const adjacentPoint = point.copy().addTo(new WorldPoint(x, y));
          const cell = map.cell(adjacentPoint);

          if (
            cell.env === Glyph.Regular_Floor &&
            !cell.corpse &&
            !cell.mob?.isPlayer
          )
            return adjacentPoint;
        }
      }

      radius++;
    }

    return null;
  }
}
