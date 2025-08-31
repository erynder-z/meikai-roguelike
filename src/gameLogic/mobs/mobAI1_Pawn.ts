import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Mob } from './mob';
import { MobAI } from '../../shared-types/gameLogic/mobs/mobAI';
import { MoveCommand } from '../commands/moveCommand';

/**
 * Represents an implementation of MobAI for a pawn-type mob.
 */
export class MobAI1_Pawn implements MobAI {
  /**
   * The turn function calculates the direction from 'me' to 'enemy' and creates a new MoveCommand to move 'me' in that direction using 'game'. Then it calls the npcTurn method of the created command and returns the result.
   *
   * @param me - The 'me' Mob object.
   * @param enemy - The 'enemy' Mob object.
   * @param game - The Game object.
   * @return The result of the npcTurn method call.
   */
  public turn(me: Mob, enemy: Mob, game: GameState): boolean {
    const dir = me.pos.directionTo(enemy.pos);
    const cmd = new MoveCommand(dir, me, game);
    return cmd.npcTurn();
  }
}
