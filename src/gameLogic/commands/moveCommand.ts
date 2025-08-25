import { Act } from './act';
import { CommandBase } from './commandBase';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameMapType } from '../../types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../../types/gameBuilder/gameState';
import { Glyph } from '../glyphs/glyph';
import { GlyphMap } from '../glyphs/glyphMap';
import { Inventory } from '../inventory/inventory';
import { ItemObject } from '../itemObjects/itemObject';
import { Mob } from '../mobs/mob';
import { MovementDirection } from '../../types/gameLogic/commands/movementDirections';
import { StairCommand } from './stairCommand';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Represents a move command that moves a mob in the game.
 */
export class MoveCommand extends CommandBase {
  constructor(
    public dir: WorldPoint,
    public me: Mob,
    public game: GameState,
    public act: Act = Act.Move,
  ) {
    super(me, game);
  }
  /**
   * Executes the move command for the mob.
   *
   * @returns Whether the move was successful or not.
   */
  public execute(): boolean {
    const currentPosition = this.me.pos;
    const newPosition = this.dir.plus(currentPosition);
    const map = <GameMapType>this.game.currentMap();

    if (!this.isMoveLegal(map, newPosition)) return false;

    if (
      this.me.isPlayer &&
      !this.preMovePlayerChecks(currentPosition, newPosition)
    )
      return false;

    this.moveAndHandleExtras(map, newPosition);

    return true;
  }

  /**
   * Performs pre-move checks for the player.
   *
   * @param currentPosition - The current position of the player.
   * @param newPosition - The new position of the player.
   * @returns Returns true if the player can move, false otherwise.
   */
  private preMovePlayerChecks(
    currentPosition: WorldPoint,
    newPosition: WorldPoint,
  ): boolean {
    const inv = <Inventory>this.game.inventory;
    const overburdened = inv.totalWeight() > this.game.stats.maxCarryWeight;

    if (overburdened) {
      this.handleOverburdened();
      return false;
    }

    const movementDir = this.getMovementDirectionFromPosition(
      currentPosition,
      newPosition,
    );
    const eventCat =
      EventCategory[`moving_${movementDir}` as keyof typeof EventCategory];
    this.game.addCurrentEvent(eventCat);
    return true;
  }

  /**
   * Checks if a move is legal based on the provided map and position.
   *
   * @param map - The map object representing the game world.
   * @param position - The position to check if it is legal to move to.
   * @return Returns true if the move is legal, false otherwise.
   */
  private isMoveLegal(map: GameMapType, position: WorldPoint): boolean {
    return !map.isBlocked(position);
  }

  /**
   * Moves the mob to the specified position and handles any additional actions if the mob is a player.
   *
   * @param map - The game map representing the game world.
   * @param position - The position to move the mob to.
   */
  private moveAndHandleExtras(map: GameMapType, position: WorldPoint): void {
    this.moveMobAndResetCounter(map, position);

    if (this.me.isPlayer) {
      this.dealWithTraps(map, position);
      this.dealWithStairs(map, position);
      this.flashIfItem();
    }
  }

  /**
   * Moves the mob to the specified position and resets the counter for the number of turns since the last move.
   *
   * @param map - The game map representing the game world.
   * @param position - The position to move the mob to.
   */
  private moveMobAndResetCounter(map: GameMapType, position: WorldPoint): void {
    this.me.sinceMove = 0;
    map.moveMob(this.me, position);
  }

  /**
   * Deals with stairs in the map.
   *
   * @param map - The game map representing the game world.
   * @param position - The position to check for stairs.
   */
  private dealWithStairs(map: GameMapType, position: WorldPoint): void {
    const cell = map.cell(position);
    let direction: number | null = null;

    if (cell.env === Glyph.Stairs_Down) {
      direction = 1;
    } else if (cell.env === Glyph.Stairs_Up) {
      direction = -1;
    }

    if (direction !== null) {
      new StairCommand(direction, this.game).raw();
    }
  }

  /**
   * Deals with traps on the map by checking the cell at the specified position for a hidden trap.
   *
   * @param map - The map to check for traps.
   * @param position - The position to check for traps.
   */
  private dealWithTraps(map: GameMapType, position: WorldPoint): void {
    const cell = map.cell(position);

    if (cell.env === Glyph.Hidden_Trap) {
      const msg = new LogMessage('You step on a trap!', EventCategory.trap);

      this.game.message(msg);
      cell.env = Glyph.Visible_Trap;

      const newGlyphInfo = GlyphMap.getGlyphInfo(Glyph.Visible_Trap);
      cell.environment.name = newGlyphInfo.name;
      cell.environment.description = newGlyphInfo.description;
    }
  }

  /**
   * Checks if there is an item at the player's current position and flashes a message if there is.
   */
  private flashIfItem(): void {
    const map: GameMapType = <GameMapType>this.game.currentMap();
    const playerPosition: WorldPoint = this.game.player.pos;
    const item: ItemObject | undefined = map.cell(playerPosition).obj;

    if (item) {
      const message = new LogMessage(
        `${item.description()} is lying here`,
        EventCategory.layingObject,
      );
      this.game.message(message);
    }
  }

  /**
   * Gets the direction of movement from the current position to a new position.
   *
   * @param currentPosition - The current position of the mob.
   * @param newPosition - The new position of the mob.
   * @returns The direction of movement as a string, or an empty string if the positions are the same.
   */
  private getMovementDirectionFromPosition(
    currentPosition: WorldPoint,
    newPosition: WorldPoint,
  ): MovementDirection {
    const dx = newPosition.x - currentPosition.x;
    const dy = newPosition.y - currentPosition.y;

    switch (true) {
      case dx === 0 && dy === -1:
        return 'UP';
      case dx === 0 && dy === 1:
        return 'DOWN';
      case dx === -1 && dy === 0:
        return 'LEFT';
      case dx === 1 && dy === 0:
        return 'RIGHT';
      case dx === -1 && dy === -1:
        return 'UP_LEFT';
      case dx === -1 && dy === 1:
        return 'DOWN_LEFT';
      case dx === 1 && dy === -1:
        return 'UP_RIGHT';
      case dx === 1 && dy === 1:
        return 'DOWN_RIGHT';
      default:
        return '';
    }
  }

  /**
   * Flashes a message to the player when they are overburdened, unable to move.
   */
  private handleOverburdened(): void {
    const msg = new LogMessage('You are overburdened!', EventCategory.unable);
    this.game.flash(msg);
  }
}
