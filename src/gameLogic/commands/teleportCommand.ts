import { CommandBase } from './commandBase';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameMapType } from '../../shared-types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Glyph } from '../glyphs/glyph';
import { Mob } from '../mobs/mob';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Represents a command to teleport a mob to a random point within a specified radius.
 */
export class TeleportCommand extends CommandBase {
  constructor(
    public radius: number,
    public mob: Mob,
    public game: GameState,
  ) {
    super(mob, game);
  }

  /**
   * Executes the teleport command, moving the mob to a random teleport point within a given radius.
   *
   * @return Returns true if the mob was successfully teleported, false otherwise.
   */
  public execute(): boolean {
    const map = this.game.currentMap() as GameMapType;
    const targetPoint = this.findTeleportPoint(this.mob.pos, this.radius, map);

    if (!targetPoint) return false;

    map.moveMob(this.mob, targetPoint);

    const message = new LogMessage(
      `${this.mob.name} teleports.`,
      EventCategory.teleport,
    );
    this.game.message(message);

    return true;
  }

  /**
   * Finds a teleport point within a given radius of a center point on the map.
   *
   * @param center - The center point on the map.
   * @param radius - The radius within which to search for a teleport point.
   * @param map - The map on which to search for a teleport point.
   * @return The found teleport point or null if no valid point is found.
   */
  private findTeleportPoint(
    center: WorldPoint,
    radius: number,
    map: GameMapType,
  ): WorldPoint | null {
    const random = this.game.rand;
    const newPoint = new WorldPoint();

    for (let attempts = 15; attempts > 0; attempts--) {
      const deltaX = random.randomIntegerExclusive(-radius, radius);
      const deltaY = random.randomIntegerExclusive(-radius, radius);
      newPoint.x = center.x + deltaX;
      newPoint.y = center.y + deltaY;

      if (
        (map.isLegalPoint(newPoint) &&
          map.cell(newPoint).env === Glyph.Chasm_Edge) ||
        (map.isLegalPoint(newPoint) &&
          map.cell(newPoint).env === Glyph.Chasm_Center)
      )
        return newPoint;

      if (!map.isLegalPoint(newPoint) || map.isBlocked(newPoint)) {
        continue;
      }

      console.table({ newPoint, deltaX, deltaY });
      return newPoint;
    }
    return null;
  }
}
