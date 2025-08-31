import { Mob } from '../../../gameLogic/mobs/mob';
import { GameState } from '../../gameBuilder/gameState';

export type Tick = {
  mob: Mob;
  game: GameState;
  amount?: number;
  tick(duration: number, timeLeft: number): void;
};

export type BuffType = {
  buff: number;
  duration: number;
  timeLeft: number;
  effect: Tick | undefined;
};
