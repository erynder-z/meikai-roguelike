import { CommandBase } from './commandBase';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { FindFreeSpace } from '../../maps/helpers/findFreeSpace';
import { GameMapType } from '../../types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../../types/gameBuilder/gameState';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Represents a command for changing the level when using stairs.
 */
export class StairCommand extends CommandBase {
  constructor(
    public levelDir: number,
    public game: GameState,
  ) {
    super(game.player, game);
  }

  /**
   * Executes the stair command.
   *
   * @returns True if the command execution is successful, otherwise false.
   */
  public execute(): boolean {
    const { game, levelDir } = this;
    const { dungeon } = game;

    const newLevel = dungeon.level + levelDir;
    const newMap = dungeon.getMapForLevel(newLevel, game);
    const direction = levelDir !== -1 ? 'descends' : 'ascends';
    const newPos = this.getNewPos(direction, newMap, game);

    const message = new LogMessage(
      `Player ${direction} to level ${newLevel}.`,
      EventCategory.lvlChange,
    );
    game.message(message);
    dungeon.playerSwitchLevel(newLevel, newPos, game);
    return true;
  }

  /**
   * Returns the new position on the map based on the direction and the new map.
   *
   * @param direction - The direction of movement ('ascends' or 'descends').
   * @param newMap - The new map to move to.
   * @param game - The game object.
   * @return The new position on the map.
   */
  private getNewPos(
    direction: string,
    newMap: GameMapType,
    game: GameState,
  ): WorldPoint {
    if (newMap.downStairPos && direction === 'ascends') {
      return newMap.downStairPos;
    } else if (newMap.upStairPos && direction === 'descends') {
      return newMap.upStairPos;
    } else {
      return FindFreeSpace.findFree(newMap, game.rand);
    }
  }
}
