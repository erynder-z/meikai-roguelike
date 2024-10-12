import { AutoHeal } from '../../gameLogic/commands/autoHeal';
import { Builder } from '../../gameBuilder/builder';
import { Equipment } from '../../gameLogic/inventory/equipment';
import { EventCategory, LogMessage } from '../../gameLogic/messages/logMessage';
import { Inventory } from '../../gameLogic/inventory/inventory';
import { Map } from '../gameLogic/maps/mapModel/map';
import { MapHandler } from '../../gameBuilder/mapHandler';
import { MessageLog } from '../../gameLogic/messages/messageLog';
import { Mob } from '../../gameLogic/mobs/mob';
import { MobAI } from '../gameLogic/mobs/mobAI';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { Stats } from '../../gameLogic/stats/stats';

export type GameState = {
  rand: RandomGenerator;
  player: Mob;
  ai: MobAI | null;
  log: MessageLog;
  dungeon: MapHandler;
  build: Builder;
  autoHeal: AutoHeal | undefined;
  inventory: Inventory | undefined;
  equipment: Equipment | undefined;
  stats: Stats;
  currentMap(): Map | null;
  message(msg: LogMessage): void;
  flash(msg: LogMessage): void;
  addCurrentEvent(evt: EventCategory): void;
};
