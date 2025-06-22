import { BaseScreen } from './baseScreen';
import { Equipment } from '../inventory/equipment';
import { EquipmentScreenDisplay } from '../../ui/equipmentScreenDIsplay/equipmentScreenDisplay';
import { GameState } from '../../types/gameBuilder/gameState';
import { ItemObject } from '../itemObjects/itemObject';
import { ItemScreen } from './itemScreen';
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
    private equipment: Equipment = <Equipment>game.equipment,
  ) {
    super(game, make);
  }

  /**
   * Converts slot position to corresponding character.
   * @param pos - The slot position.
   * @return The character representing the slot.
   */
  private slotToCharacter(pos: Slot): string {
    return String.fromCharCode(97 + (pos - Slot.MainHand));
  }

  /**
   * Converts character to corresponding slot position.
   *
   * @param char - The character representing the slot.
   * @return The slot position.
   */
  private CharacterToSlot(char: string): Slot {
    const i: number = char.charCodeAt(0) - 'a'.charCodeAt(0) + Slot.MainHand;
    return i in Slot ? (i as Slot) : Slot.NotWorn;
  }

  /**
   * Draws the equipment screen.
   */
  public drawScreen(): void {
    const canvas = document.getElementById('canvas1') as HTMLCanvasElement;

    if (!this.display) {
      this.display = document.createElement(
        'equipment-screen-display',
      ) as EquipmentScreenDisplay;

      canvas?.insertAdjacentElement('afterend', this.display);

      const equipmentData = this.getEquipmentData();
      this.display.items = equipmentData;
      this.display.menuKeyText = this.activeControlScheme.menu.toString();
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
    description: string;
  }[] {
    const data: { char: string; slot: string; description: string }[] = [];
    for (let slot = Slot.MainHand; slot < Slot.Last; ++slot) {
      const item = this.equipment.getItemInSlot(slot);
      data.push({
        char: this.slotToCharacter(slot),
        slot: Slot[slot],
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
   * Handles the key down event.
   * @param event - The keyboard event.
   * @param stack - The stack object.
   * @return True if the event was handled successfully, otherwise false.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): boolean {
    const slot = this.CharacterToSlot(event.key);
    if (slot) {
      this.fadeOutEquipmentScreen();
      this.itemMenu(slot, stack);
    }
    if (event.key === this.activeControlScheme.menu.toString()) {
      this.fadeOutEquipmentScreen();
      stack.pop();
      return true;
    }
    return false;
  }

  /**
   * Opens the item menu for the specified slot.
   *
   * Retrieves the item from the given slot and, if the item exists,
   * removes the current screen from the stack and pushes a new
   * ItemScreen onto the stack with the retrieved item.
   *
   * @param slot - The slot of the item to open the menu for.
   * @param stack - The stack object.
   */
  private itemMenu(slot: Slot, stack: Stack): void {
    const item: ItemObject | undefined = this.equipment.getItemInSlot(slot);

    if (!item) return;
    const pos = this.CharacterToSlot(slot.toString());
    stack.pop();
    stack.push(new ItemScreen(item, pos, this.game, this.make));
  }
}
