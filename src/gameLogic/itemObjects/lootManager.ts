import { GameMapType } from '../../shared-types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { EnvironmentChecker } from '../environment/environmentChecker';
import { FindFreeSpace } from '../../maps/helpers/findFreeSpace';
import { ItemObjectManager } from './itemObjectManager';
import { LogMessage, EventCategory } from '../messages/logMessage';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Handles loot management.
 */
export class LootManager {
  /**
   * Attempts to drop loot at the given position on the map.
   *
   * @param pos - The position where the loot will be dropped.
   * @param game - The current game state.
   * @param level - The level of the loot.
   */
  public static dropLoot(
    pos: WorldPoint,
    game: GameState,
    level: number,
    maxDropRadius: number = 5,
  ): void {
    const map = <GameMapType>game.currentMap();
    const lootCell = map.cell(pos);

    if (!EnvironmentChecker.canItemsBeDropped(lootCell)) {
      const np = FindFreeSpace.findFreeAdjacent(pos, map, maxDropRadius);
      if (!np) return;
      pos = np;
    }

    this.addLootAndLog(pos, map, game, level);
  }

  /**
   * Adds a random loot object at the specified position and logs the event.
   *
   * @param pos - The position where the loot will be added.
   * @param map - The game map.
   * @param game - The game object.
   * @param level - The level of the loot.
   */
  private static addLootAndLog(
    pos: WorldPoint,
    map: GameMapType,
    game: GameState,
    level: number,
  ): void {
    const rand = game.rand;
    const objectLvl = level + 1;
    const obj = ItemObjectManager.addRandomObjectForLevel(
      pos,
      map,
      rand,
      objectLvl,
    );
    const msg = new LogMessage(
      `You notice a ${obj.name()} dropping on the floor.`,
      EventCategory.drop,
    );
    game.message(msg);
  }
}
