import { GameState } from '../../shared-types/gameBuilder/gameState';
import { MobAI } from '../../shared-types/gameLogic/mobs/mobAI';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../shared-types/terminal/stack';
import { MoveBumpCommand } from '../commands/moveBumpCommand';
import { Mob } from './mob';

/**
 * Represents an implementation of MobAI for a ant-type mob.
 * Ants always move in a random direction.
 */
export class MobAI3_Ant implements MobAI {
  public turn(
    me: Mob,
    _enemy: Mob,
    game: GameState,
    stack: Stack,
    make: ScreenMaker,
  ): boolean {
    const { rand } = game;
    const dir = rand.randomDirectionForcedMovement();
    return new MoveBumpCommand(dir, me, game, stack, make).npcTurn();
  }
}
