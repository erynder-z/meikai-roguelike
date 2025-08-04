import { BaseScreen } from './baseScreen';
import { CraftingHandler } from '../crafting/craftingHandler';
import { CraftingScreenDisplay } from '../../ui/craftingScreenDisplay/craftingScreenDisplay';
import { GameState } from '../../types/gameBuilder/gameState';
import { ItemObject } from '../itemObjects/itemObject';
import { Inventory } from '../inventory/inventory';
import keys from '../../utilities/commonKeyboardChars.json';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../types/terminal/stack';

/**
 * Represents the screen for the crafting menu.
 */
export class CraftingScreen extends BaseScreen {
  public name = 'crafting-screen';
  private display: CraftingScreenDisplay | null = null;
  private combineItems: ItemObject[] = [];
  constructor(
    public game: GameState,
    public make: ScreenMaker,
    private inventory: Inventory = <Inventory>game.inventory,
  ) {
    super(game, make);
  }

  /**
   * Renders the crafting screen display via a custom component.
   */
  public drawScreen(): void {
    const canvas = document.getElementById(
      'terminal-canvas',
    ) as HTMLCanvasElement;
    if (!this.display) {
      this.display = document.createElement(
        'crafting-screen-display',
      ) as CraftingScreenDisplay;
      canvas?.insertAdjacentElement('afterend', this.display);
      this.display.items = this.inventory.items;
      this.display.maxIngredients = this.game.stats.maxCraftIngredients;
    }
  }

  /**
   * Fades out the crafting screen.
   *
   * @return A promise that resolves when the fade out animation ends.
   */
  private async fadeOutCraftingScreen(): Promise<void> {
    if (this.display) {
      await this.display.fadeOut();
    }
  }

  /**
   * Handles key down events in the crafting screen.
   *
   * @param event - The keyboard event.
   * @param stack - The stack of screens.
   * @return True if the event was handled, otherwise false.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): boolean {
    if (this.handleItemSelection(event.key)) return true;
    if (this.handleMenuKey(event.key, stack)) return true;
    if (this.handleScroll(event)) return true;

    return false;
  }

  /**
   * Handles item selection in the crafting screen.
   *
   * @param key - The key pressed.
   * @returns True if an item was selected/deselected, otherwise false.
   */
  private handleItemSelection(key: string): boolean {
    const pos = this.characterToPosition(key);
    if (pos < 0) {
      return false;
    }

    const item = this.inventory.items[pos];
    const index = this.combineItems.indexOf(item);

    if (index !== -1) {
      this.combineItems.splice(index, 1);
    } else {
      this.combineItems.push(item);
    }

    if (this.display) {
      this.display.combined = this.combineItems;
    }

    return true;
  }

  /**
   * Handles the menu key being pressed in the crafting screen.
   *
   * If the menu key is pressed, the crafting screen is faded out and popped from the stack.
   * If the combine key is pressed, the items in the combine list are combined.
   *
   * @param key - The key pressed.
   * @param stack - The stack of screens.
   * @return True if the event was handled, otherwise false.
   */
  private handleMenuKey(key: string, stack: Stack): boolean {
    switch (key) {
      case this.activeControlScheme.menu.toString():
        this.fadeOutCraftingScreen();
        stack.pop();
        return true;
      case this.activeControlScheme.combine_items.toString():
        this.handleCombine();
        return true;
      default:
        return false;
    }
  }

  /**
   * Handles scrolling in the crafting screen.
   *
   * @param event - The keyboard event.
   * @returns True if the screen was scrolled, otherwise false.
   */
  private handleScroll(event: KeyboardEvent): boolean {
    if (this.isAltKeyPressed(event) && this.display) {
      this.display.handleVirtualScroll(event);
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
    return pos >= 0 && pos < this.inventory.length() ? pos : -1;
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

  /**
   * Clears the list of items to combine.
   *
   * @remarks
   * This also updates the display to show an empty list of combined items.
   */
  private clearCombineItems(): void {
    this.combineItems = [];
    if (this.display) {
      this.display.combined = this.combineItems;
    }
  }

  /**
   * Combines the selected items in the crafting screen.
   *
   * This function uses the CraftingHandler to attempt to combine the items
   * that are currently selected in the crafting interface. If a valid item
   * is created as a result of the combination, it is added to the inventory.
   * After attempting the combination, the list of items to combine is cleared.
   */
  private handleCombine(): void {
    const maxIngredients = this.game.stats.maxCraftIngredients;
    const craftingHandler = new CraftingHandler(this.inventory, maxIngredients);

    const result = craftingHandler.combine(...this.combineItems);

    if (result) this.inventory.add(result);

    this.clearCombineItems();
  }
}
