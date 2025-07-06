import { EventCategory } from '../gameLogic/messages/logMessage';
import { GameMapType } from '../types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../types/gameBuilder/gameState';
import { WorldPoint } from '../maps/mapModel/worldPoint';

/**
 * Holds the maps of the game.
 */
export class MapHandler {
  public level: number = 0;
  public maps: GameMapType[] = [];

  /**
   * Retrieves the current map of the dungeon based on the current level.
   *
   * @param game - The game object.
   * @returns The current map.
   */
  public currentMap(game: GameState): GameMapType {
    return this.getLevel(this.level, game);
  }

  /**
   * Retrieves a specific level of the dungeon.
   * If the level does not exist, it is generated.
   *
   * @param level - The level number.
   * @param game - The game object.
   * @returns The map of the specified level.
   */
  public getLevel(level: number, game: GameState): GameMapType {
    if (!this.hasLevel(level)) {
      const map = game.build.makeLevel(game.rand, level, game.surfaceTemp);
      this.add(map, level);
    }
    return this.maps[level];
  }

  /**
   * Checks if the dungeon has a specific level.
   *
   * @param level - The level number to check.
   * @returns True if the dungeon has the level, otherwise false.
   */
  private hasLevel(level: number): boolean {
    return level < this.maps.length && !!this.maps[level];
  }

  /**
   * Adds a map to a specified level of the dungeon.
   *
   * @param map - The map to add.
   * @param level - The level number where the map should be added.
   */
  private add(map: GameMapType, level: number): void {
    if (level >= this.maps.length) {
      this.extendMaps(level + 1);
    }
    this.maps[level] = map;
  }

  /**
   * Extends the maps array to a specified length.
   *
   * @param len - The new length of the maps array.
   */
  private extendMaps(len: number): void {
    this.maps.length = len;
  }

  /**
   * Adjusts the current visibility range of the player based on the current level
   * being dark or not.
   *
   * @param game - The game object.
   */
  private adjustLevelVisibilityRange(game: GameState): void {
    if (this.currentMap(game).isDark) {
      game.stats.adjustCurrentVisibilityRange(
        parseFloat((game.stats.visibilityRange * 0.25).toFixed(1)),
      );
    } else {
      game.stats.adjustCurrentVisibilityRange(game.stats.visibilityRange);
    }
  }

  /**
   * Switches the player to a new level, adjusting the player's visibility range based
   * on the level's darkness and logging the level change event.
   *
   * @param newLevel - The new level number.
   * @param newPosition - The new position of the player on the new level.
   * @param game - The game object.
   */
  public playerSwitchLevel(
    newLevel: number,
    newPosition: WorldPoint,
    game: GameState,
  ): void {
    const player = game.player;

    this.currentMap(game).removeMob(player);
    this.level = newLevel;
    this.adjustLevelVisibilityRange(game);
    this.currentMap(game).enterMap(player, newPosition);

    if (game.dungeon.level === 0) game.shouldShowStoryScreen = true;

    game.log.addCurrentEvent(EventCategory.lvlChange);
  }
}
