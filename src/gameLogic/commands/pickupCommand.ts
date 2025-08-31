import { CommandBase } from './commandBase';
import { Equipment } from '../inventory/equipment';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameMapType } from '../../shared-types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Inventory } from '../inventory/inventory';

/**
 * Represents a command to pick up an item from the game map and add it to the player's inventory.
 */
export class PickupCommand extends CommandBase {
  constructor(public game: GameState) {
    super(game.player, game);
  }

  /**
   * Executes the pickup command.
   *
   * @returns Returns true if the command is executed successfully, otherwise false.
   */
  public execute(): boolean {
    const { game } = this;
    const { player } = game;

    const map = <GameMapType>game.currentMap();
    const inventory = <Inventory>game.inventory;
    const cell = map.cell(player.pos);
    const item = cell.obj;
    const isPlayer = this.me.isPlayer;

    if (!item) {
      this.noItemMessage();
      return false;
    }

    if (isPlayer && this.exceedsMaxCarryWeight()) return false;

    cell.obj = undefined;
    inventory.add(item);

    this.successMessage();

    return true;
  }

  /**
   * Displays a message indicating that the item was picked up successfully.
   */
  private successMessage(): void {
    const { game } = this;
    const msg = new LogMessage('You picked up the item.', EventCategory.pickup);
    game.message(msg);
  }

  /**
   * Displays a flash message indicating that there is no item to pick up.
   */
  private noItemMessage(): void {
    const { game } = this;
    const msg = new LogMessage(
      'There is nothing here to pick up.',
      EventCategory.unable,
    );
    game.flash(msg);
  }

  /**
   * Checks if the player is carrying more items than their maximum carry weight.
   *
   * @returns Returns true if the player is carrying too many items, false otherwise.
   */
  private exceedsMaxCarryWeight(): boolean {
    const { game } = this;
    const inventory = <Inventory>game.inventory;
    const equipment = <Equipment>game.equipment;
    const maxCarryWeight = game.stats.maxCarryWeight;

    if (inventory.totalWeight() + equipment.totalWeight() > maxCarryWeight) {
      const msg = new LogMessage(
        'Unable to pickup, because you are carrying too much stuff!',
        EventCategory.unable,
      );
      game.flash(msg);
      return true;
    }
    return false;
  }
}
