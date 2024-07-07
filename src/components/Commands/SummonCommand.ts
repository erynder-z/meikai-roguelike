import { EventCategory, LogMessage } from '../Messages/LogMessage';
import { GameState } from '../Builder/Types/GameState';
import { GameMap } from '../MapModel/GameMap';
import { Mob } from '../Mobs/Mob';
import { MultiplyCommand } from './MultiplyCommand';
import { WorldPoint } from '../MapModel/WorldPoint';

/**
 * Represents a command that spawns a mob.
 */
export class SummonCommand extends MultiplyCommand {
  constructor(
    public me: Mob,
    public g: GameState,
  ) {
    super(me, g);
  }
  /**
   * Spawns a mob at the given world point on the specified game map.
   *
   * @param {WorldPoint} p - The coordinates of the world point where the mob should be spawned.
   * @param {GameMap} map - The game map on which the mob should be spawned.
   * @param {GameState} g - The game object.
   * @return {void} This function does not return a value.
   */
  public spawnMob(p: WorldPoint, map: GameMap, g: GameState): void {
    const m = this.me;
    const b = g.build;
    const s = b.addMapLevel_Mob(p, map, g.rand);
    const msg = new LogMessage(
      `${m.name} summons ${s}`,
      EventCategory.mobSpawn,
    );
    g.message(msg);
  }
}
