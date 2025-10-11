import { Mob } from '../../../gameLogic/mobs/mob';
import { GameState } from '../../gameBuilder/gameState';
import { Stack } from '../../terminal/stack';
import { ScreenMaker } from '../screens/ScreenMaker';

export type MobAI = {
  turn(
    me: Mob,
    enemy: Mob,
    game: GameState,
    stack: Stack,
    make: ScreenMaker,
  ): boolean;
};
