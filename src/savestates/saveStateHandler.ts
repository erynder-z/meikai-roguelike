import { ActiveBuffs } from '../gameLogic/buffs/activeBuffs';
import { Buff } from '../gameLogic/buffs/buffEnum';
import { BuffCommand } from '../gameLogic/commands/buffCommand';
import { Corpse } from '../gameLogic/mobs/corpse';
import { EquipCommand } from '../gameLogic/commands/equipCommand';
import { Game } from '../gameBuilder/gameModel';
import { gameConfigManager } from '../gameConfigManager/gameConfigManager';
import { GameMap } from '../maps/mapModel/gameMap';
import { GameState } from '../types/gameBuilder/gameState';
import { Glyph } from '../gameLogic/glyphs/glyph';
import { ItemObject } from '../gameLogic/itemObjects/itemObject';
import { Inventory } from '../gameLogic/inventory/inventory';
import { LayoutManager } from '../ui/layoutManager/layoutManager';
import { LogMessage } from '../gameLogic/messages/logMessage';
import { MapCell } from '../maps/mapModel/mapCell';
import { Mob } from '../gameLogic/mobs/mob';
import {
  SerializedCorpseData,
  SerializedDungeonData,
  SerializedGameMap,
  SerializedGameState,
  SerializedItemData,
  SerializedMapCell,
  SerializedMapCellArray,
  SerializedMapQueue,
  SerializedMobData,
} from '../types/utilities/saveStateHandler';
import { TurnQueue } from '../gameLogic/turnQueue/turnQueue';
import { WorldPoint } from '../maps/mapModel/worldPoint';
import { Tick } from '../types/gameLogic/buffs/buffType';
import { StatChangeBuffCommand } from '../gameLogic/commands/statChangeBuffCommand';
import { MapHandler } from '../gameBuilder/mapHandler';
import { MessageLog } from '../gameLogic/messages/messageLog';
import { AutoHeal } from '../gameLogic/commands/autoHeal';
import { NeedsHandler } from '../gameLogic/needs/needsHandler';
import { Stats } from '../gameLogic/stats/stats';
import { Builder } from '../gameBuilder/builder';
import { Slot } from '../gameLogic/itemObjects/slot';
import { MobAI } from '../types/gameLogic/mobs/mobAI';

type ReadyToSaveGameState = {
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
  serializedShownStoryLevels: {
    id: string;
    data: number[];
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

/**
 * Handles serializing and deserializing the game state to and from JSON.
 */
export class SaveStateHandler {
  /**
   * Prepares the game state for saving by serializing various components.
   *
   * @param gameState - The current game state to serialize.
   * @return The serialized game state ready for saving.
   */
  public prepareForSave(gameState: GameState): ReadyToSaveGameState {
    const gameConfig = gameConfigManager.getConfig();

    const {
      ai,
      log,
      dungeon,
      autoHeal,
      inventory,
      equipment,
      needs,
      stats,
      player,
      build,
      surfaceTemp,
      shownStoryLevels,
    } = gameState;

    const serializedAI = this.getAIData(ai);
    const serializedLog = this.getLogData(log);
    const serializedDungeon = this.getDungeonData(dungeon);
    const serializedAutoHeal = this.getAutoHealData(autoHeal);
    const serializedInventory = this.getInventoryData(inventory);
    const serializedEquipment = this.getEquipmentData(equipment);
    const serializedNeeds = this.getNeedsData(needs);
    const serializedStats = this.getStatsData(stats);
    const serializedSurfaceTemp = this.getSurfaceTempData(surfaceTemp);
    const serializedShownStoryLevels =
      this.getShownStoryLevels(shownStoryLevels);
    const serializedPlayer = this.getPlayerData(player);
    const serializedPlayerBuffs = this.getPlayerBuffsData(player);
    const serializedBuild = this.getBuildData(build);

    const playerConfig = gameConfig.player;

    return {
      serializedAI,
      serializedLog,
      serializedDungeon,
      serializedAutoHeal,
      serializedInventory,
      serializedEquipment,
      serializedNeeds,
      serializedStats,
      serializedSurfaceTemp,
      serializedShownStoryLevels,
      serializedPlayer,
      serializedPlayerBuffs,
      serializedBuild,
      playerConfig,
    };
  }

  /**
   * Serializes the AI data.
   *
   * @param ai - The AI state of the game.
   * @return Serialized AI data.
   */
  private getAIData(ai: GameState['ai']): ReadyToSaveGameState['serializedAI'] {
    return {
      id: 'AI',
      data: ai,
    };
  }

  /**
   * Serializes the game log.
   *
   * @param log - The game log.
   * @return Serialized log data.
   */
  private getLogData(
    log: GameState['log'],
  ): ReadyToSaveGameState['serializedLog'] {
    return {
      id: 'MESSAGELOG',
      data: log,
    };
  }

  /**
   * Serializes the dungeon data.
   *
   * @param dungeon - The game's dungeon data.
   * @return Serialized dungeon data.
   */
  private getDungeonData(
    dungeon: GameState['dungeon'],
  ): ReadyToSaveGameState['serializedDungeon'] {
    return {
      id: 'DUNGEON',
      data: dungeon,
    };
  }

  /**
   * Serializes the auto-heal state.
   *
   * @param autoHeal - The game's auto-heal data.
   * @return Serialized auto-heal data.
   */
  private getAutoHealData(
    autoHeal: GameState['autoHeal'],
  ): ReadyToSaveGameState['serializedAutoHeal'] {
    return {
      id: 'AUTOHEAL',
      data: autoHeal,
    };
  }

  /**
   * Serializes the inventory data.
   *
   * @param inventory - The player's inventory.
   * @return Serialized inventory data.
   */
  private getInventoryData(
    inventory: GameState['inventory'],
  ): ReadyToSaveGameState['serializedInventory'] {
    return {
      id: 'INVENTORY',
      data: inventory,
    };
  }

  /**
   * Serializes the player's equipment.
   *
   * @param equipment - The player's equipment.
   * @return Serialized equipment data.
   */
  private getEquipmentData(
    equipment: GameState['equipment'],
  ): ReadyToSaveGameState['serializedEquipment'] {
    const objectifiedEquipment = equipment
      ? Array.from(equipment?._objs.entries())
      : [];
    return {
      id: 'EQUIPMENT',
      data: objectifiedEquipment,
    };
  }

  /**
   * Serializes the player's needs.
   *
   * @param needs - The player's needs.
   * @return Serialized needs data.
   */
  private getNeedsData(
    needs: GameState['needs'],
  ): ReadyToSaveGameState['serializedNeeds'] {
    return {
      id: 'NEEDS',
      data: needs,
    };
  }

  /**
   * Serializes the player's stats.
   *
   * @param stats - The player's stats.
   * @return Serialized stats data.
   */
  private getStatsData(
    stats: GameState['stats'],
  ): ReadyToSaveGameState['serializedStats'] {
    return {
      id: 'STATS',
      data: stats,
    };
  }

  /**
   * Serializes the surface temperature.
   *
   * @param surfaceTemp - The surface temperature.
   * @return Serialized surface temperature data.
   */
  private getSurfaceTempData(
    surfaceTemp: GameState['surfaceTemp'],
  ): ReadyToSaveGameState['serializedSurfaceTemp'] {
    return {
      id: 'SURFACETEMP',
      data: surfaceTemp,
    };
  }

  /**
   * Serializes the levels of the story that the player has seen so far.
   *
   * @param shownStoryLevels - The levels of the story that the player has seen.
   * @return Serialized shown story levels data.
   */
  private getShownStoryLevels(
    shownStoryLevels: GameState['shownStoryLevels'],
  ): ReadyToSaveGameState['serializedShownStoryLevels'] {
    return {
      id: 'SHOWNSTORYLEVELS',
      data: shownStoryLevels,
    };
  }

  /**
   * Serializes the player object.
   *
   * @param player - The player mob.
   * @return Serialized player data.
   */
  private getPlayerData(
    player: GameState['player'],
  ): ReadyToSaveGameState['serializedPlayer'] {
    const playerClone = structuredClone(player);
    playerClone.buffs = player.buffs;
    return {
      id: 'PLAYER',
      data: playerClone,
    };
  }

  /**
   * Serializes the player's active buffs.
   *
   * @param player - The player mob.
   * @return Serialized buffs data.
   */
  private getPlayerBuffsData(
    player: GameState['player'],
  ): ReadyToSaveGameState['serializedPlayerBuffs'] {
    const buffsArray: {
      buff: Buff;
      duration: number;
      timeLeft: number;
      effect: Tick | undefined;
    }[] = [];
    const playerBuffs = player.buffs.getBuffsMap();

    playerBuffs.forEach((value, key) => {
      buffsArray.push({
        buff: key,
        duration: value.duration,
        timeLeft: value.timeLeft,
        effect: value.effect,
      });
    });

    return {
      id: 'PLAYERBUFFS',
      data: buffsArray,
    };
  }

  /**
   * Serializes the build data.
   *
   * @param build - The current game build information.
   * @return Serialized build data.
   */
  private getBuildData(
    build: GameState['build'],
  ): ReadyToSaveGameState['serializedBuild'] {
    return {
      id: 'BUILD',
      data: build,
    };
  }

  /**
   * Restores the dungeon state from the serialized data.
   *
   * @param game - The current game instance to which the dungeon state will be restored.
   * @param serializedDungeon - The serialized data containing the dungeon level and maps.
   * @param player - The player mob.
   * @return The game state after restoring the dungeon.
   */
  public restoreDungeon(
    game: Game,
    serializedDungeon: SerializedDungeonData,
    player: Mob,
  ): GameState {
    this.setDungeonLevel(game, serializedDungeon.level);
    this.restoreDungeonMaps(game, serializedDungeon.maps, player);
    return game;
  }

  /**
   * Sets the current dungeon level.
   *
   * @param game - The current game instance.
   * @param level - The level to set.
   */
  private setDungeonLevel(game: Game, level: number): void {
    game.dungeon.level = level;
  }

  /**
   * Restores the dungeon maps from serialized data.
   *
   * @param game - The current game instance where maps will be restored.
   * @param dungeonMaps - The serialized map data to restore.
   * @param player - The player mob.
   */
  private restoreDungeonMaps(
    game: Game,
    dungeonMaps: SerializedGameMap[],
    player: Mob,
  ): void {
    game.dungeon.maps = dungeonMaps.map(map =>
      this.restoreSingleMap(map, player),
    );
  }

  /**
   * Restores a single map from the serialized data.
   *
   * @param map - The serialized map data to restore.
   * @param player - The player mob.
   * @return The restored map.
   */
  private restoreSingleMap(map: SerializedGameMap, player: Mob): GameMap {
    const restoredCells = this.restoreMapCells(map.cells);

    const restoredMap = new GameMap(
      new WorldPoint(map.dimensions.x, map.dimensions.y),
      Glyph.Unknown,
      map.level,
      map.isDark,
      [],
      map.temperature,
      map.depth,
      new WorldPoint(map.upStairPos?.x ?? 0, map.upStairPos?.y ?? 0),
      new WorldPoint(map.downStairPos?.x ?? 0, map.downStairPos?.y ?? 0),
      new TurnQueue(),
    );

    restoredMap.cells = restoredCells;

    const serializedQueue = map.queue;
    restoredMap.queue = this.restoreMapQueue(serializedQueue, player);

    return restoredMap;
  }

  /**
   * Restores a 2D array of map cells from the serialized data.
   *
   * @param cells - The serialized map cell data to restore.
   * @return The restored 2D array of map cells.
   */
  private restoreMapCells(cells: SerializedMapCellArray[]): MapCell[][] {
    return cells.map(cellArray => this.restoreCellArray(cellArray));
  }

  /**
   * Restores a single 1D array of map cells from the serialized data.
   *
   * @param cellArray - The serialized map cell data to restore.
   * @return The restored 1D array of map cells.
   */
  private restoreCellArray(cellArray: SerializedMapCellArray): MapCell[] {
    return cellArray.map(cell => this.restoreSingleCell(cell));
  }

  /**
   * Restores a single map cell from the serialized data.
   *
   * @param cell - The serialized map cell data to restore.
   * @return The restored map cell.
   */
  private restoreSingleCell(cell: SerializedMapCell): MapCell {
    const newCell = new MapCell(cell.env);

    newCell.mob = cell.mob ? this.restoreMob(cell.mob) : undefined;
    newCell.lit = cell.lit;
    newCell.obj = cell.obj ? this.restoreItemObject(cell.obj) : undefined;
    newCell.sprite = cell.sprite ?? undefined;
    newCell.environment = {
      glyph: cell.environment?.glyph ?? Glyph.Unknown,
      name: cell.environment?.name ?? '',
      description: cell.environment?.description ?? '',
      defaultBuffDuration: cell.environment?.defaultBuffDuration ?? 0,
      effects: cell.environment?.effects ?? [],
    };
    newCell.corpse = cell.corpse ? this.restoreCorpse(cell.corpse) : undefined;
    newCell.bloody = cell.bloody ?? { isBloody: false, intensity: 0 };

    return newCell;
  }

  /**
   * Restores a single mob from the serialized data.
   *
   * @param serializedMob - The serialized mob data to restore.
   * @return The restored mob.
   */
  private restoreMob(serializedMob: SerializedMobData): Mob {
    const mob = new Mob(
      serializedMob.glyph,
      serializedMob.pos.x,
      serializedMob.pos.y,
    );

    mob.id = serializedMob.id;
    mob.name = serializedMob.name;
    mob.description = serializedMob.description;
    mob.hp = serializedMob.hp;
    mob.maxhp = serializedMob.maxhp;
    mob.mood = serializedMob.mood;
    mob.level = serializedMob.level;
    mob.sinceMove = serializedMob.sinceMove;
    mob.isPlayer = serializedMob.isPlayer;
    mob.buffs = new ActiveBuffs();
    mob.bloody = serializedMob.bloody;
    mob.baseStrength = serializedMob.baseStrength;
    mob.currentStrength = serializedMob.currentStrength;

    return mob;
  }

  /**
   * Restores a single item object from the serialized data.
   *
   * @param serializedItem - The serialized item object data to restore.
   * @return The restored item object.
   */
  private restoreItemObject(serializedItem: SerializedItemData): ItemObject {
    const item = new ItemObject(
      serializedItem.glyph,
      serializedItem.slot,
      serializedItem.category.map(cat => cat),
      serializedItem.level,
      serializedItem.weight,
    );

    item.id = serializedItem.id;
    item.spellCasting.spell = serializedItem.spellCasting.spell;
    item.spellCasting.charges = serializedItem.spellCasting.charges;
    item.spellCasting.description = serializedItem.spellCasting.description;
    item.spellCasting.effectMagnitude =
      serializedItem.spellCasting.effectMagnitude;

    return item;
  }

  /**
   * Restores a single corpse from the serialized data.
   *
   * @param serializedCorpse - The serialized corpse data to restore.
   * @return The restored corpse.
   */
  private restoreCorpse(serializedCorpse: SerializedCorpseData): Corpse {
    const corpse = new Corpse(
      serializedCorpse.glyph,
      serializedCorpse.pos.x,
      serializedCorpse.pos.y,
    );

    corpse.id = serializedCorpse.id;

    return corpse;
  }

  /**
   * Restores the turn queue of a map from the given serialized data.
   *
   * @param serializedQueue - The serialized queue data to restore.
   * @param player - The player mob.
   * @return The restored turn queue.
   */
  private restoreMapQueue(
    serializedQueue: SerializedMapQueue,
    player: Mob,
  ): TurnQueue {
    const newQueue = new TurnQueue();
    serializedQueue.mobs.map(mob => {
      const mobToPush = mob.isPlayer ? player : this.restoreMob(mob);
      newQueue.pushMob(mobToPush);
    });

    return newQueue;
  }

  /**
   * Restores the player's state from the given save state.
   *
   * @param saveState - The save state to restore from.
   * @return The restored player mob.
   */
  public restorePlayer(saveState: SerializedGameState): Mob {
    const playerPos = new WorldPoint(
      saveState.serializedPlayer.data.pos.x,
      saveState.serializedPlayer.data.pos.y,
    );

    const player = new Mob(Glyph.Player, playerPos.x, playerPos.y);
    player.name = saveState.serializedPlayer.data.name;
    player.hp = saveState.serializedPlayer.data.hp;
    player.maxhp = saveState.serializedPlayer.data.maxhp;
    player.level = saveState.serializedPlayer.data.level;
    player.bloody = saveState.serializedPlayer.data.bloody;
    return player;
  }

  /**
   * Restores the player's buffs from the given save state.
   *
   * @param game - The game to restore the buffs to.
   * @param player - The player mob.
   * @param saveState - The save state to restore from.
   * @return The game state after restoring the buffs.
   */
  public restorePlayerBuffs(
    game: GameState,
    player: Mob,
    saveState: SerializedGameState,
  ): GameState {
    const buffs = saveState.serializedPlayerBuffs.data;

    for (const buff of buffs) {
      if (this.isStatChangingBuff(buff.buff) && buff.effect) {
        new StatChangeBuffCommand(
          buff.buff,
          player,
          game,
          player,
          buff.effect?.amount,
          buff.duration,
          buff.timeLeft,
        ).execute();
      } else {
        new BuffCommand(
          buff.buff,
          player,
          game,
          player,
          buff.duration,
          buff.timeLeft,
        ).execute();
      }
    }
    return game;
  }

  /**
   * Determines whether the given buff enum value is a stat changing buff.
   * This is used to determine whether a buff should be executed as a stat changing buff or not.
   *
   * @param buffEnumValue - The value of the enum to check.
   * @return True if the buff is a stat changing buff, false otherwise.
   */
  private isStatChangingBuff(buffEnumValue: number): boolean {
    return (
      buffEnumValue === Buff.AttackUp ||
      buffEnumValue === Buff.AttackDown ||
      buffEnumValue === Buff.DefenseUp ||
      buffEnumValue === Buff.DefenseDown
    );
  }

  /**
   * Restores the player's inventory from the given save state.
   *
   * @param game - The game state.
   * @param saveState - The save state to restore from.
   * @return The updated game state.
   */

  public restorePlayerInventory(
    game: GameState,
    saveState: SerializedGameState,
  ): GameState {
    const inv = <Inventory>game.inventory;
    const items = saveState.serializedInventory.data?.items;
    if (items) {
      for (const serializedItem of items) {
        const item = new ItemObject(
          serializedItem.glyph,
          serializedItem.slot,
          serializedItem.category,
          serializedItem.level,
          serializedItem.weight,
        );
        item.spellCasting.spell = serializedItem.spellCasting.spell;
        item.spellCasting.charges = serializedItem.spellCasting.charges;
        item.spellCasting.description =
          serializedItem.spellCasting.description;
        item.spellCasting.effectMagnitude =
          serializedItem.spellCasting.effectMagnitude;
        inv.add(item);
      }
    }
    return game;
  }

  /**
   * Restores the player's equipment from the given save state.
   *
   * @param  game - The game state.
   * @param saveState - The save state to restore from.
   * @return The updated game state.
   */
  public restorePlayerEquipment(
    game: GameState,
    saveState: SerializedGameState,
  ): GameState {
    const items = saveState.serializedEquipment.data;

    if (items) {
      for (const item of items) {
        const serializedItem = item[1];
        const itm = new ItemObject(
          serializedItem.glyph,
          serializedItem.slot,
          serializedItem.category,
          serializedItem.level,
          serializedItem.weight,
        );
        itm.spellCasting.spell = serializedItem.spellCasting.spell;
        itm.spellCasting.charges = serializedItem.spellCasting.charges;
        itm.spellCasting.description =
          serializedItem.spellCasting.description;
        itm.spellCasting.effectMagnitude =
          serializedItem.spellCasting.effectMagnitude;
        new EquipCommand(itm, item[0] as number, game).execute();
      }
    }
    return game;
  }

  /**
   * Restores the game log from the given save state.
   *
   * @param game - The game instance whose log is to be restored.
   * @param saveState - The save state containing the serialized log data.
   */
  public restoreLog(game: Game, saveState: SerializedGameState): void {
    const serializedLog = saveState.serializedLog.data;
    const log = game.log;
    const layoutManager = new LayoutManager();

    serializedLog.archive.forEach(msg => {
      log.archive.push(new LogMessage(msg.message, msg.category));
    });
    // redraw messages, so the messages do not get displayed as new messages.
    layoutManager.redrawMessages(log);
  }

  /**
   * Restores the player's stats from the given save state.
   *
   * This function updates the game's stats object with values from the serialized stats in the save state. Default values are applied if the serialized data lacks specific stats.
   *
   * @param game - The game instance whose stats are to be restored.
   * @param saveState - The save state containing the serialized stats data.
   */
  public restoreStats(game: Game, saveState: SerializedGameState): void {
    const restoredStats = game.stats;
    const serializedStats = saveState.serializedStats.data;

    restoredStats.visibilityRange = serializedStats.visibilityRange || 15;
    restoredStats.currentVisibilityRange =
      serializedStats.currentVisibilityRange || 15;
    restoredStats.turnCounter = serializedStats.turnCounter || 1;
    restoredStats.mobKillCounter = serializedStats.mobKillCounter || 0;
    restoredStats.damageDealtCounter = serializedStats.damageDealtCounter || 0;
    restoredStats.damageReceivedCounter =
      serializedStats.damageReceivedCounter || 0;
    restoredStats.currentTurnReceivedDmg =
      serializedStats.currentTurnReceivedDmg || 0;
    restoredStats.damageDealModifier =
      serializedStats.damageDealModifier || 1.0;
    restoredStats.damageReceiveModifier =
      serializedStats.damageReceiveModifier || 1.0;
    restoredStats.baseStrength = serializedStats.baseStrength || 4;
    restoredStats.currentStrength = serializedStats.currentStrength || 4;
    restoredStats.mood = serializedStats.mood || 'Normal';
    restoredStats.hunger = serializedStats.hunger || 0;
    restoredStats.thirst = serializedStats.thirst || 0;
  }

  /**
   * Restores the levels of the story that the player has seen so far from the given save state.
   *
   * @param game - The game instance whose shown story levels are to be restored.
   * @param saveState - The save state containing the serialized shown story levels data.
   */
  public restoreShownStoryLevels(
    game: Game,
    saveState: SerializedGameState,
  ): void {
    const shownStoryLevels = saveState.serializedShownStoryLevels.data;
    game.shownStoryLevels = shownStoryLevels;
  }
}
