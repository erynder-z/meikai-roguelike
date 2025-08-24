import { BaseScreen } from './baseScreen';
import { Equipment } from '../inventory/equipment';
import { GameState } from '../../types/gameBuilder/gameState';
import { groupInventory } from '../../utilities/inventoryUtils';
import { Inventory } from '../inventory/inventory';
import { InventoryScreenDisplay } from '../../ui/inventoryScreenDisplay/inventoryScreenDisplay';
import { ItemScreen } from './itemScreen';
import { KeypressScrollHandler } from '../../utilities/KeypressScrollHandler';
import keys from '../../utilities/commonKeyboardChars.json';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../types/terminal/stack';

/**
 * Represents an inventory screen.
 */
export class InventoryScreen extends BaseScreen {
  public name = 'inventory-screen';
  private display: InventoryScreenDisplay | null = null;
  constructor(
    public game: GameState,
    public make: ScreenMaker,
    private inventory: Inventory = <Inventory>game.inventory,
    private equipment: Equipment = <Equipment>game.equipment,
  ) {
    super(game, make);
  }

  /**
   * Renders the inventory screen via a custom component.
   */
  public drawScreen(): void {
    const canvas = document.getElementById(
      'terminal-canvas',
    ) as HTMLCanvasElement;
    if (!this.display) {
      this.display = document.createElement(
        'inventory-screen-display',
      ) as InventoryScreenDisplay;
      canvas?.insertAdjacentElement('afterend', this.display);
    }

    if (this.display)
      this.display.update({
        items: this.inventory.items,
        wornItemsWeight: this.equipment.totalWeight(),
        maxCarryWeight: this.game.stats.maxCarryWeight,
      });
  }

  /**
   * Fades out the inventory screen.
   *
   * @return A promise that resolves when the fade out animation ends.
   */
  private async fadeOutInventoryScreen(): Promise<void> {
    if (this.display) {
      await this.display.fadeOut();
    }
  }

  /**
   * Handles key down events in the inventory screen.
   * If the menu key is pressed, the inventory screen fades out and is removed from the stack.
   * If a valid item position is entered, the item menu is opened.
   * If the alt or meta key is pressed, the inventory list is scrolled.
   *
   * @param event - The keyboard event.
   * @param stack - The stack of screens.
   * @return True if the event was handled, otherwise false.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): boolean {
    const pos = this.characterToPosition(event.key);
    if (pos >= 0) {
      this.fadeOutInventoryScreen();
      this.itemMenu(pos, stack);
    } else if (event.key === this.activeControlScheme.menu.toString()) {
      this.fadeOutInventoryScreen();
      stack.pop();
      return true;
    }

    // scroll via keypress when alt or meta key is pressed
    if (this.isAltKeyPressed(event)) {
      const scrollContainer = this.display?.shadowRoot?.querySelector(
        '.inventory-screen-display',
      ) as HTMLElement;
      new KeypressScrollHandler(scrollContainer).handleVirtualScroll(event);
      return true;
    }
    return false;
  }

  /**
   * Converts a character to a corresponding position in the inventory.
   * The character is converted to a number by subtracting the char code of 'a' from the char code of the given character.
   * If the resulting position is valid (i.e. within the range of the inventory), it is returned.
   * Otherwise -1 is returned.
   *
   * @param c - The character to convert.
   * @return The position of the character in the inventory, or -1 if not valid.
   */
  private characterToPosition(c: string): number {
    const pos = keys.keys.indexOf(c);
    const groupedItems = groupInventory(this.inventory.items);

    if (pos >= 0 && pos < groupedItems.length) {
      const item = groupedItems[pos].item;
      return this.inventory.items.indexOf(item);
    }
    return -1;
  }

  /**
   * Opens the item menu screen.
   *
   * @param pos - The position of the item in the inventory.
   * @param stack - The stack of screens.
   */
  private itemMenu(pos: number, stack: Stack): void {
    const item = this.inventory.items[pos];
    stack.pop();
    stack.push(new ItemScreen(item, pos, this.game, this.make));
  }

  /**
   * Checks if the Alt or Meta key is pressed.
   *
   * @param event - The keyboard event.
   * @return True if the Alt or Meta key is pressed, otherwise false.
   */
  private isAltKeyPressed(event: KeyboardEvent): boolean {
    return event.altKey || event.metaKey;
  }
}
