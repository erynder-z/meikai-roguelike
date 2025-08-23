import { BaseScreen } from './baseScreen';
import { Equipment } from '../inventory/equipment';
import { EquipmentScreenDisplay } from '../../ui/equipmentScreenDIsplay/equipmentScreenDisplay';
import { GameState } from '../../types/gameBuilder/gameState';
import { Inventory } from '../inventory/inventory';
import { ItemScreen } from './itemScreen';
import keys from '../../utilities/commonKeyboardChars.json';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Slot } from '../itemObjects/slot';
import { Stack } from '../../types/terminal/stack';

/**
 * Represents a equipment screen.
 */
export class EquipmentScreen extends BaseScreen {
  public name = 'equipment-screen';
  private display: EquipmentScreenDisplay | null = null;
  constructor(
    public game: GameState,
    public make: ScreenMaker,
    private inventory: Inventory = <Inventory>game.inventory,
    private equipment: Equipment = <Equipment>game.equipment,
  ) {
    super(game, make);
  }

  /**
   * Converts a slot position to the corresponding character.
   * @param pos - The slot position to convert.
   * @return The character represented by the slot position.
   */
  private slotToCharacter(pos: Slot): string {
    return keys.keys[pos - Slot.MainHand];
  }

  /**
   * Converts a character to the corresponding slot position.
   * If the character is not found in the keys list, or its index is out of range,
   * Slot.NotWorn is returned.
   * @param char - The character to convert.
   * @return The slot position represented by the character.
   */
  private CharacterToSlot(char: string): Slot {
    const index = keys.keys.indexOf(char);
    return index < 0 || index >= Slot.Last
      ? Slot.NotWorn
      : ((index + Slot.MainHand) as Slot);
  }

  /**
   * Draws the equipment screen.
   */
  public drawScreen(): void {
    const canvas = document.getElementById(
      'terminal-canvas',
    ) as HTMLCanvasElement;

    if (!this.display) {
      this.display = document.createElement(
        'equipment-screen-display',
      ) as EquipmentScreenDisplay;

      canvas?.insertAdjacentElement('afterend', this.display);
    }

    if (this.display) {
      this.display.update({
        items: this.getEquipmentData(),
        inventoryWeight: this.inventory.totalWeight(),
      });
    }
  }

  /**
   * Formats the equipment data for the display component.
   *
   * @return Formatted equipment data.
   */
  private getEquipmentData(): {
    char: string;
    slot: string;
    weight: number;
    description: string;
  }[] {
    const data: {
      char: string;
      slot: string;
      weight: number;
      description: string;
    }[] = [];
    for (let slot = Slot.MainHand; slot < Slot.Last; ++slot) {
      const item = this.equipment.getItemInSlot(slot);
      data.push({
        char: this.slotToCharacter(slot),
        slot: Slot[slot],
        weight: item ? item.weight : 0,
        description: item ? item.description() : 'none',
      });
    }
    return data;
  }

  /**
   * Fades out the equipment screen.
   *
   * @return A promise that resolves when the fade out animation ends.
   */
  private async fadeOutEquipmentScreen(): Promise<void> {
    if (this.display) {
      await this.display.fadeOut();
      this.display.remove();
    }
  }

  /**
   * Handles key down events and fades out the equipment screen if the menu key is pressed.
   * If a slot key is pressed, opens the item menu for the item in the slot if it exists.
   *
   * @param event - The keyboard event.
   * @param stack - The stack of screens.
   * @return True if the event is handled, otherwise false.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): boolean {
    const key = event.key;

    if (key === this.activeControlScheme.menu.toString()) {
      this.fadeOutEquipmentScreen();
      stack.pop();
      return true;
    }

    const slot = this.CharacterToSlot(key);
    if (!slot) return false;

    // Open item menu if an item exists in the slot
    return this.itemMenu(slot, stack);
  }

  /**
   * Opens the item menu for the specified slot.
   *
   * If the slot contains an item, fades out the screen,
   * pops the current screen, and pushes an ItemScreen.
   *
   * @param slot - The slot of the item to open the menu for.
   * @param stack - The stack object.
   * @return True if the menu was opened, otherwise false.
   */
  private itemMenu(slot: Slot, stack: Stack): boolean {
    const item = this.equipment.getItemInSlot(slot);
    if (!item) return false;

    this.fadeOutEquipmentScreen();
    stack.pop();
    stack.push(new ItemScreen(item, slot, this.game, this.make));
    return true;
  }
}
