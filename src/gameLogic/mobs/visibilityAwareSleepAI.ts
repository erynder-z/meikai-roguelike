import { CanSee } from '../../maps/helpers/canSee';
import { GameMap } from '../../maps/mapModel/gameMap';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { MobAI } from '../../shared-types/gameLogic/mobs/mobAI';
import { Mob } from './mob';
import { Mood } from './moodEnum';

/**
 * An AI implementation for Mobs in a sleep state.
 */
export class VisibilityAwareSleepAI implements MobAI {
  /**
   * Takes a turn for the Mob in a sleep state. Checks if the player is near and can see the enemy. If so, there is a 33% chance that the Mob will become awake.
   *
   * @param me - The Mob making the turn.
   * @param enemy - The enemy Mob.
   * @param game - The game instance.
   * @returns Always returns true.
   */
  public turn(me: Mob, enemy: Mob, game: GameState): boolean {
    if (!VisibilityAwareSleepAI.isNear(me, enemy)) return true;
    const map = <GameMap>game.currentMap();
    const canSee = CanSee.checkMobLOS_Bresenham(me, enemy, map, true);
    if (!canSee) return true;

    me.mood = game.rand.isOneIn(3) ? Mood.Awake : Mood.Asleep;
    return true;
  }

  /**
   * Checks if an enemy Mob is within a certain distance of the given Mob.
   *
   * @param me - The Mob to check from.
   * @param enemy - The enemy Mob to check the distance to.
   * @return `true` if the enemy is near, `false` otherwise.
   */
  private static isNear(me: Mob, enemy: Mob): boolean {
    const distance = me.pos.distanceTo(enemy.pos);
    return distance < 6;
  }
}
