import { Mob } from '../../../gameLogic/mobs/mob';
import { WorldPoint } from '../../../maps/mapModel/worldPoint';
import { GameState } from '../../gameBuilder/gameState';
import { Cost } from './cost';

export type Command = {
  me: Mob;
  game: GameState;
  cost?: Cost;
  target?: Mob;
  execute(): boolean;
  turn(): boolean;
  raw(): boolean;
  npcTurn(): boolean;
  setDirection(direction: WorldPoint): Command;
  setCost(cost?: Cost): void;
  setTarget(target: Mob): void;
};
