import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Mob } from './mob';
import { MobAI } from '../../shared-types/gameLogic/mobs/mobAI';
import { MoveBumpCommand } from '../commands/moveBumpCommand';
import { Stack } from '../../shared-types/terminal/stack';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';

/**
 * Represents an implementation of MobAI for a ant-type mob.
 * Ants always move in a random direction.
 */
export class MobAI3_Ant implements MobAI {
  public turn(
    me: Mob,
    enemy: Mob,
    game: GameState,
    stack: Stack,
    make: ScreenMaker,
  ): boolean {
    const { rand } = game;
    const dir = rand.randomDirectionForcedMovement();
    return new MoveBumpCommand(dir, me, game, stack, make).npcTurn();
  }
}
