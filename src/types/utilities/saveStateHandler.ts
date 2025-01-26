import { AutoHeal } from '../../gameLogic/commands/autoHeal';
import { Builder } from '../../gameBuilder/builder';
import { Buff } from '../../gameLogic/buffs/buffEnum';
import { Inventory } from '../../gameLogic/inventory/inventory';
import { ItemObject } from '../../gameLogic/itemObjects/itemObject';
import { MapHandler } from '../../gameBuilder/mapHandler';
import { MessageLog } from '../../gameLogic/messages/messageLog';
import { Mob } from '../../gameLogic/mobs/mob';
import { MobAI } from '../gameLogic/mobs/mobAI';
import { Slot } from '../../gameLogic/itemObjects/slot';
import { Stats } from '../../gameLogic/stats/stats';

export type ReadyToSaveGameState = {
  serializedAI: {
    id: string;
    data: MobAI | null;
  };
  serializedLog: {
    id: string;
    data: MessageLog;
  };
  serializedDungeon: {
    id: string;
    data: MapHandler;
  };
  serializedAutoHeal: {
    id: string;
    data: AutoHeal | undefined;
  };
  serializedInventory: {
    id: string;
    data: Inventory | undefined;
  };
  serializedEquipment: {
    id: string;
    data: [Slot, ItemObject][];
  };
  serializedStats: {
    id: string;
    data: Stats;
  };
  serializedPlayer: {
    id: string;
    data: Mob;
  };
  serializedPlayerBuffs: {
    id: string;
    data: {
      buff: Buff;
      duration: number;
    }[];
  };
  serializedBuild: {
    id: string;
    data: Builder;
  };
  playerConfig: {
    name: string;
    appearance: 'boyish' | 'girlish';
    color: string;
    avatar: string;
  };
};

export type SerializedGameState = {
  serializedAI: { id: string; data: SerializedAIData };
  serializedLog: { id: string; data: SerializedLogData };
  serializedDungeon: { id: string; data: SerializedDungeonData };
  serializedAutoHeal: { id: string; data: SerializedAutoHealData };
  serializedInventory: { id: string; data: SerializedInventoryData };
  serializedEquipment: { id: string; data: SerializedEquipmentData };
  serializedStats: { id: string; data: SerializedStatsData };
  serializedPlayer: { id: string; data: SerializedPlayerData };
  serializedPlayerBuffs: {
    id: string;
    data: SerializedBuffData[];
  };
  serializedBuild: { id: string; data: SerializedBuild };
  playerConfig: SerializedPlayerConfig;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SerializedAIData = any;

export type SerializedLogData = {
  archive: {
    id: string;
    message: string;
    category: number;
  }[];
  currentEvent: number;
  queue: {
    id: string;
    message: string;
    category: number;
  }[];
};

export type SerializedDungeonData = {
  level: number;
  maps: SerializedGameMap[];
};

export type SerializedAutoHealData = {
  amount: number;
  amountToHealMin: number;
  nextWait: number;
  countdown: number;
  timeToHealMax: number;
};

export type SerializedInventoryData = {
  items: SerializedItemData[];
};

export type SerializedItemData = {
  charges: number;
  desc: string;
  glyph: number;
  level: number;
  slot: number;
  spell: number;
  category: number[];
};
export type SerializedEquipmentData = [number, SerializedItemData][];

export type SerializedStatsData = {
  currentTurnReceivedDmg: number;
  currentVisRange: number;
  damageDealtCounter: number;
  damageReceivedCounter: number;
  defaultVisRange: number;
  mobKillCounter: number;
  turnCounter: number;
};

export type SerializedPlayerData = {
  pos: SerializedWorldPoint;
  name: string;
  hp: number;
  maxhp: number;
  level: number;
};

export type SerializedBuffData = {
  buff: number;
  duration: number;
  timeLeft: number;
};

export type SerializedGameMap = {
  dimensions: SerializedWorldPoint;
  level: number;
  cells: SerializedMapCellArray[];
  isDark: boolean;
  upStairPos?: SerializedWorldPoint;
  downStairPos?: SerializedWorldPoint;
  queue: SerializedMapQueue;
};

export type SerializedMapCellArray = SerializedMapCell[];

export type SerializedMapCell = {
  env: number;
  mob?: SerializedMobData;
  lit: boolean;
  obj?: SerializedItemData;
  sprite?: number;
  corpse?: SerializedCorpseData;
  environment?: {
    glyph: number;
    name: string;
    description: string;
    effects: number[];
  };
};

export type SerializedMapQueue = {
  mobs: SerializedMobData[];
};

export type SerializedBuild = {
  player: SerializedPlayerConfig;
  seed: number;
};

export type SerializedPlayerConfig = {
  name: string;
  appearance: 'boyish' | 'girlish';
  color: string;
  avatar: string;
};

export type SerializedMobData = {
  id: string;
  pos: SerializedWorldPoint;
  glyph: number;
  name: string;
  description: string;
  hp: number;
  maxhp: number;
  mood: SerializedMobMood;
  level: number;
  sinceMove: number;
  isPlayer: boolean;
  buffs: SerializedBuffData[];
};

export type SerializedCorpseData = {
  id: string;
  pos: SerializedWorldPoint;
  glyph: number;
  name: string;
  description: string;
};

export type SerializedWorldPoint = {
  x: number;
  y: number;
};

export type SerializedMobMood = number;
