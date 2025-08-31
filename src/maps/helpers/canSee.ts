import { BresenhamIterator } from './bresenhamIterator';
import { GameMapType } from '../../shared-types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Mob } from '../../gameLogic/mobs/mob';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Provides methods to check visibility between points or entities on a map.
 */
export class CanSee {
  /**
   * Checks if there is a line of sight between two world points on the map.
   *
   * @param a - The starting point.
   * @param b - The ending point.
   * @param map - The map object.
   * @param onlyEnv - Indicates whether to consider only environmental obstacles.
   * @return True if there is a line of sight, otherwise false.
   */
  public static checkPointLOS_Bresenham(
    a: WorldPoint,
    b: WorldPoint,
    map: GameMapType,
    onlyEnv: boolean,
  ): boolean {
    const i: BresenhamIterator = BresenhamIterator.createFromWorldPoint(a, b);
    for (; !i.done(); ) {
      const p: WorldPoint = i.next();
      const cell = map.cell(p);
      if (cell.isOpaque()) return false;
    }
    return true;
  }

  /**
   * Checks if there is a line of sight between two mobs on the map.
   *
   * @param a - The first mob.
   * @param b - The second mob.
   * @param map - The map object.
   * @param onlyEnv - Indicates whether to consider only environmental obstacles.
   * @return True if there is a line of sight, otherwise false.
   */
  public static checkMobLOS_Bresenham(
    a: Mob,
    b: Mob,
    map: GameMapType,
    onlyEnv: boolean,
  ): boolean {
    return this.checkPointLOS_Bresenham(a.pos, b.pos, map, onlyEnv);
  }

  /**
   * Performs raycasting to determine line of sight between two points on the map.
   *
   * @param start - The starting point of the LOS check.
   * @param end - The ending point of the LOS check.
   * @param map - The map object.
   * @return True if there is line of sight, otherwise false.
   */
  public static checkPointLOS_RayCast(
    start: WorldPoint,
    end: WorldPoint,
    map: GameMapType,
  ): boolean {
    // Get the differences in coordinates between the start and end points
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);

    // Determine the direction of movement for the ray (1 or -1)
    const sx = start.x < end.x ? 1 : -1;
    const sy = start.y < end.y ? 1 : -1;

    // Error accumulator for adjusting the y coordinate when moving in the x direction
    let err = dx - dy;

    // Current position of the ray
    let x = start.x;
    let y = start.y;

    // Perform raycasting
    while (x !== end.x || y !== end.y) {
      // Check if the current position is inside the map bounds
      if (!map.isLegalPoint(new WorldPoint(x, y))) {
        return false; // Hit map boundary, LOS blocked
      }

      // Check if the current cell blocks LOS
      const cell = map.cell(new WorldPoint(x, y));
      if (cell.isOpaque()) {
        return false; // Cell blocks LOS
      }

      // Adjust the position of the ray based on the error accumulator
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }

    // No obstacles encountered, LOS is clear
    return true;
  }

  /**
   * Checks if the distance between two points is smaller than a provided threshold.
   *
   * @param a - The first point.
   * @param b - The second point.
   * @param threshold - The maximum allowed distance.
   * @return True if the distance is smaller than the threshold, otherwise false.
   */
  public static isDistanceSmallerThan(
    a: WorldPoint,
    b: WorldPoint,
    threshold: number,
  ): boolean {
    return a.squaredDistanceTo(b) <= threshold;
  }

  /**
   * Calculates the maximum distance at which entities can be seen by the player,
   * taking into account the player's current visibility range, light sources in the
   * vicinity, and a maximum visibility limit.
   *
   * @param playerPos - The position of the player on the map.
   * @param map - The current game map.
   * @param game - The game state, containing player stats and buffs.
   * @return The maximum distance at which entities can be seen by the player.
   */

  public static getFarDist(
    playerPos: WorldPoint,
    map: GameMapType,
    game: GameState,
  ): number {
    const glowRange = 10;
    const maxVisibilityRange = 100;
    let farDist = game.stats.currentVisibilityRange || 15;

    const glowingRocks = this.countLightSources(playerPos, map, glowRange);
    const additionalDistancePerGlowingRock = 20;
    farDist += glowingRocks * additionalDistancePerGlowingRock;

    return Math.min(farDist, maxVisibilityRange);
  }

  /**
   * Counts the number of light sources in the vicinity of the player position within a specified diameter.
   *
   * @param playerPos - The position of the player on the map.
   * @param map - The current map.
   * @param diameter - The diameter within which to count light sources.
   * @return The count of light sources in the specified vicinity.
   */
  private static countLightSources(
    playerPos: WorldPoint,
    map: GameMapType,
    diameter: number,
  ): number {
    let lightSources = 0;
    for (const neighbor of playerPos.getNeighbors(Math.floor(diameter * 0.5))) {
      if (map.isLegalPoint(neighbor) && map.cell(neighbor).isGlowing()) {
        lightSources++;
      }
    }
    return lightSources;
  }
}
