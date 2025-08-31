import { Cost } from './cost';
import { GameState } from '../../gameBuilder/gameState';
import { Mob } from '../../../gameLogic/mobs/mob';
import { WorldPoint } from '../../../maps/mapModel/worldPoint';

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
