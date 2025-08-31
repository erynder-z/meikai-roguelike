import { WorldPoint } from '../../../maps/mapModel/worldPoint';
import { Mob } from '../../../gameLogic/mobs/mob';

export type Step = {
  executeStep(): Step | null;
  setPos(pos: WorldPoint): void;
  setDirection(dir: WorldPoint): void;
  setTarget(tgt: Mob): void;
  setTime(time: number): void;
};
