import { GameState } from '../../types/gameBuilder/gameState';
import { Mob } from './mob';
import { MobAI } from '../../types/gameLogic/mobs/mobAI';
import { Mood } from './moodEnum';

/**
 * An AI implementation for Mobs in a sleep state.
 */
export class SimpleSleepAI implements MobAI {
  /**
   * Takes a turn for the Mob in a sleep state.
   *
   * @param me - The Mob making the turn.
   * @param enemy - The enemy Mob.
   * @param game - The game instance.
   * @return Always returns true.
   */
  public turn(me: Mob, enemy: Mob, game: GameState): boolean {
    if (SimpleSleepAI.isNear(me, enemy)) {
      me.mood = game.rand.isOneIn(3) ? Mood.Awake : Mood.Asleep;
    }
    return true;
  }

  /**
   * Checks if an enemy Mob is within a certain distance of the given Mob.
   *
   * @param me - The Mob to check from.
   * @param enemy - The enemy Mob to check the distance to.
   * @return `true` if the enemy is near, `false` otherwise.
   */
  public static isNear(me: Mob, enemy: Mob): boolean {
    const distance = me.pos.distanceTo(enemy.pos);
    return distance < 6;
  }
}
