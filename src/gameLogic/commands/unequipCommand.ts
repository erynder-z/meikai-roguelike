import { CommandBase } from './commandBase';
import { Equipment } from '../inventory/equipment';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameState } from '../../types/gameBuilder/gameState';
import { ItemObject } from '../itemObjects/itemObject';
import { Slot } from '../itemObjects/slot';

/**
 * Represents a command to unequip an item in a game.
 */
export class UnequipCommand extends CommandBase {
  constructor(
    public slot: Slot,
    public game: GameState,
  ) {
    super(game.player, game);
  }

  /**
   * Executes the unequip command.
   *
   * @returns True if the command executed successfully, false otherwise.
   */
  public execute(): boolean {
    const { slot, game } = this;

    if (slot == Slot.NotWorn) return false;

    const equipment = <Equipment>game.equipment;

    const obj: ItemObject | undefined = equipment.getItemInSlot(slot);
    if (!obj) throw 'obj is undefined';

    equipment.remove(slot);
    game.inventory!.add(obj);
    const msg = new LogMessage(
      `${obj.description()} is now unequipped.`,
      EventCategory.equip,
    );
    game.message(msg);
    return true;
  }
}
