import { GameMap } from '../../maps/mapModel/gameMap';
import { WorldPoint } from '../../maps/mapModel/worldPoint';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { Mob } from '../mobs/mob';
import { MultiplyCommand } from './multiplyCommand';

/**
 * Represents a command that spawns a mob.
 */
export class SummonCommand extends MultiplyCommand {
  constructor(
    public me: Mob,
    public game: GameState,
  ) {
    super(me, game);
  }
  /**
   * Spawns a mob at the given world point on the specified game map.
   *
   * @param wp - The coordinates of the world point where the mob should be spawned.
   * @param map - The game map on which the mob should be spawned.
   * @param game - The game object.
   */
  public spawnMob(wp: WorldPoint, map: GameMap, game: GameState): void {
    const { me } = this;
    const { build } = game;

    const spawn = build.addMapLevel_Mob(wp, map, game.rand);
    const msg = new LogMessage(
      `${me.name} summons ${spawn}`,
      EventCategory.mobSpawn,
    );
    game.message(msg);
  }
}
