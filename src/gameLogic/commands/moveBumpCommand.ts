import { Able } from '../../types/gameLogic/commands/able';
import { Act } from './act';
import { CommandBase } from './commandBase';
import { GameMap } from '../../maps/mapModel/gameMap';
import { GameState } from '../../types/gameBuilder/gameState';
import { HitCommand } from './hitCommand';
import { MagnetismHandler } from '../../maps/helpers/magnetismHandler';
import { MapCell } from '../../maps/mapModel/mapCell';
import { Mob } from '../mobs/mob';
import { MoveCommand } from './moveCommand';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../types/terminal/stack';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Represents a command to conditionally call a MoveCommand or a HitCommand.
 */
export class MoveBumpCommand extends CommandBase {
  constructor(
    public dir: WorldPoint,
    public me: Mob,
    public game: GameState,
    public stack: Stack,
    public make: ScreenMaker,
  ) {
    super(me, game);
  }

  /**
   * Determines if a mob is able to perform a certain action.
   *
   * @param mob - The mob performing the action.
   * @param game - The game object.
   * @param act - The action being performed.
   * @returns An object indicating if the mob is able to perform the action and if it uses a turn.
   */
  public able(mob: Mob, game: GameState, act: Act): Able {
    return { isAble: true, usesTurn: false };
  }

  /**
   * Executes the function and returns a boolean value.
   *
   * @return the result of the function execution
   */
  public execute(): boolean {
    const { game, me, dir } = this;

    const currentPosition = me.pos;
    const newPosition = currentPosition.plus(dir);
    const map = <GameMap>game.currentMap();

    this.checkForConfusion(game, this.dir);

    if (!this.isPositionLegal(map, newPosition)) return false;

    const cell = map.cell(newPosition);
    const canGetStuckInWall = false; // Determines whether a magnet can pull an entity towards a wall and using a turn. Mobs should set this to false.
    const magnetizedPos = MagnetismHandler.getMagnetizedPosition(
      map,
      currentPosition,
      newPosition,
      game.rand,
      canGetStuckInWall,
    );

    if (magnetizedPos) {
      return new MoveCommand(magnetizedPos, me, game).turn();
    }

    this.executeMoveOrHit(cell, me, game);

    return true;
  }

  /**
   * Checks if the mob is confused.
   *
   * @param game - The game object for handling randomness.
   * @param direction - The direction to update.
   */
  private checkForConfusion(game: GameState, direction: WorldPoint): void {
    this.confused(game, direction);
  }

  /**
   * Checks if the given position is legal on the map.
   *
   * @param map - The game map to check against.
   * @param position - The position to check for legality.
   * @return True if the position is legal, false otherwise.
   */
  private isPositionLegal(map: GameMap, position: WorldPoint): boolean {
    return map.isLegalPoint(position);
  }

  /**
   * Executes a move or hit action based on the cell being occupied by a mob or not.
   *
   * @param cell - The cell to check for mob presence.
   * @param mob - The mob performing the action.
   * @param game - The game object.
   * @return Returns the result of the move or hit action.
   */
  private executeMoveOrHit(cell: MapCell, mob: Mob, game: GameState): boolean {
    return cell.mob
      ? new HitCommand(mob, cell.mob, game, this.stack, this.make).turn()
      : new MoveCommand(this.dir, mob, game).turn();
  }
}
