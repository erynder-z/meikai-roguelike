import { AutoHeal } from '../../gameLogic/commands/autoHeal';
import { Builder } from '../../gameBuilder/builder';
import { Buff } from '../../gameLogic/buffs/buffEnum';
import { Inventory } from '../../gameLogic/inventory/inventory';
import { ItemObject } from '../../gameLogic/itemObjects/itemObject';
import { MapHandler } from '../../gameBuilder/mapHandler';
import { MessageLog } from '../../gameLogic/messages/messageLog';
import { Mob } from '../../gameLogic/mobs/mob';
import { MobAI } from '../gameLogic/mobs/mobAI';
import { Mood } from '../gameLogic/stats/stats';
import { NeedsHandler } from '../../gameLogic/needs/needsHandler';
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
  serializedNeeds: {
    id: string;
    data: NeedsHandler | undefined;
  };
  serializedStats: {
    id: string;
    data: Stats;
  };
  serializedSurfaceTemp: {
    id: string;
    data: number;
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
  serializedNeeds: { id: string; data: SerializedNeedsData };
  serializedStats: { id: string; data: SerializedStatsData };
  serializedSurfaceTemp: { id: string; data: number };
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
  id: string;
  level: number;
  slot: number;
  spell: number;
  category: number[];
  effectMagnitude: number | null;
};

export type SerializedEquipmentData = [number, SerializedItemData][];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SerializedNeedsData = any;

export type SerializedStatsData = {
  currentTurnReceivedDmg: number;
  currentVisibilityRange: number;
  damageDealModifier: number;
  damageDealtCounter: number;
  damageReceivedCounter: number;
  damageReceiveModifier: number;
  visibilityRange: number;
  mobKillCounter: number;
  turnCounter: number;
  baseStrength: number;
  currentStrength: number;
  mood: Mood;
  hunger: number;
  thirst: number;
};

export type SerializedPlayerData = {
  pos: SerializedWorldPoint;
  name: string;
  hp: number;
  maxhp: number;
  level: number;
  bloody: { isBloody: boolean; intensity: number };
};

export type SerializedBuffData = {
  buff: number;
  duration: number;
  timeLeft: number;
  effect?:
    | { amount: number; game: SerializedGameState; mob: SerializedMobData }
    | undefined;
};

export type SerializedGameMap = {
  dimensions: SerializedWorldPoint;
  level: number;
  cells: SerializedMapCellArray[];
  isDark: boolean;
  temperature: number;
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
  bloody?: { isBloody: boolean; intensity: number };
  environment?: {
    glyph: number;
    name: string;
    description: string;
    defaultBuffDuration: number;
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
  bloody: { isBloody: boolean; intensity: number };
  baseStrength: number;
  currentStrength: number;
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
