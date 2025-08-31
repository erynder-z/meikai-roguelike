import { GameState } from '../../gameBuilder/gameState';
import { Mob } from '../../../gameLogic/mobs/mob';
import { ScreenMaker } from '../screens/ScreenMaker';
import { Stack } from '../../terminal/stack';

export type MobAI = {
  turn(
    me: Mob,
    enemy: Mob,
    game: GameState,
    stack: Stack,
    make: ScreenMaker,
  ): boolean;
};
