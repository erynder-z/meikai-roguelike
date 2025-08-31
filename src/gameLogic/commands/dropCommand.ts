import { CommandBase } from './commandBase';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameMapType } from '../../shared-types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Inventory } from '../inventory/inventory';
import { ItemObject } from '../itemObjects/itemObject';

/**
 * Represents a command to drop an item from the player's inventory.
 */
export class DropCommand extends CommandBase {
  constructor(
    public item: ItemObject,
    public index: number,
    public game: GameState,
  ) {
    super(game.player, game);
  }

  /**
   * Executes the drop command.
   *
   * @returns True if the item was dropped successfully, otherwise false.
   */
  public execute(): boolean {
    const { game } = this;
    const { player } = game;

    const map = <GameMapType>game.currentMap();
    const cell = map.cell(player.pos);

    if (cell.hasObject()) {
      const msg = new LogMessage('No room to drop here!', EventCategory.unable);
      game.flash(msg);
      return false;
    }

    cell.obj = this.item;
    const inventory = <Inventory>game.inventory;
    inventory.removeIndex(this.index);

    const msg = new LogMessage(
      `Dropped ${this.item.description()}.`,
      EventCategory.drop,
    );

    game.message(msg);
    return true;
  }
}
