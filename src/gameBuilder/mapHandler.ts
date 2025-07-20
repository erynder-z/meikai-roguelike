import { EventCategory } from '../gameLogic/messages/logMessage';
import { gameConfigManager } from '../gameConfigManager/gameConfigManager';
import { GameMapType } from '../types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../types/gameBuilder/gameState';
import { WorldPoint } from '../maps/mapModel/worldPoint';
import storyData from '../story/storyScreenData.json';

/**
 * Holds the maps of the game.
 */
export class MapHandler {
  public level: number = 0;
  public maps: GameMapType[] = [];
  public gameConfig = gameConfigManager.getConfig();

  /**
   * Retrieves the current map of the dungeon based on the current level.
   *
   * @param game - The game object.
   * @returns The current map.
   */
  public currentMap(game: GameState): GameMapType {
    return this.getMapForLevel(this.level, game);
  }

  /**
   * Retrieves a specific level of the dungeon.
   * If the level does not exist, it is generated.
   *
   * @param level - The level number.
   * @param game - The game object.
   * @returns The map of the specified level.
   */
  public getMapForLevel(level: number, game: GameState): GameMapType {
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
   * Handles the player switching levels.
   *
   * Removes the player from the current map, sets the new level, adjusts the
   * player's visibility range based on the level's lighting, and adds the player
   * back into the level at the specified position. Also checks if the level has
   * a story attached and shows the story screen if the level has a story that
   * hasn't been shown yet.
   *
   * @param newLevel - The level number to switch to.
   * @param newPosition - The position on the new level to enter.
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

    if (this.gameConfig.show_story) {
      const storyLevels = storyData.story.map(s => parseInt(s.level, 10));
      if (
        storyLevels.includes(this.level) &&
        !game.shownStoryLevels.includes(this.level)
      ) {
        game.shouldShowStoryScreen = true;
        game.shownStoryLevels.push(this.level);
      }
    }

    game.log.addCurrentEvent(EventCategory.lvlChange);
  }
}
