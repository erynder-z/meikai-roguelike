import { BaseScreen } from './baseScreen';
import { CraftingHandler } from '../crafting/craftingHandler';
import { CraftingScreenDisplay } from '../../ui/craftingScreenDisplay/craftingScreenDisplay';
import { CraftedItemDisplay } from '../../ui/craftedItemDisplay/craftedItemDisplay';
import { GameState } from '../../types/gameBuilder/gameState';
import { groupInventory } from '../../utilities/inventoryUtils';
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
  private craftedItemDisplay: CraftedItemDisplay | null = null;
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
    if (this.craftedItemDisplay) {
      await this.craftedItemDisplay.fadeOut();
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
    if (this.isCraftedItemScreenShown()) return this.handleModalKeyDown(event);

    return this.handleCraftingKeyDown(event, stack);
  }

  private handleModalKeyDown(event: KeyboardEvent): boolean {
    if (event.key === this.activeControlScheme.menu.toString()) {
      this.removeCraftedItemDisplay();
    }
    return true; // Always consume input in modal state
  }

  private handleCraftingKeyDown(event: KeyboardEvent, stack: Stack): boolean {
    if (this.handleItemSelection(event)) return true;
    if (this.handleMenuActions(event, stack)) return true;
    if (this.handleScroll(event)) return true;
    return false;
  }

  /**
   * Handles key down events related to item selection.
   *
   * If the character pressed does not correspond to a valid inventory item position, the function returns false.
   * Otherwise, the item is toggled in the list of selected items and the crafting screen display is updated.
   * @param event - The keyboard event.
   * @return True if the event was handled, otherwise false.
   */
  private handleItemSelection(event: KeyboardEvent): boolean {
    const pos = this.characterToPosition(event.key);
    if (pos < 0) return false;

    this.removeCraftedItemDisplay();
    this.toggleItemForCombination(this.inventory.items[pos]);

    if (this.display) this.display.combined = this.combineItems;

    return true;
  }

  /**
   * Handles the menu key being pressed.
   *
   * If the crafted item display is showing, it is removed.
   * Otherwise, the crafting screen is faded out and removed from the stack.
   * @param event - The keyboard event.
   * @param stack - The stack of screens.
   * @returns True if the menu key is handled, otherwise false.
   */
  private handleMenuActions(event: KeyboardEvent, stack: Stack): boolean {
    switch (event.key) {
      case this.activeControlScheme.menu.toString():
        this.closeScreen(stack);
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
   * The character is converted to a number by finding its index in the list of keys.
   * If the character is not found, or its index is out of range, -1 is returned.
   *
   * @param c - The character to convert.
   * @return The position of the character in the inventory, or -1 if not found.
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
    const craftingHandler = new CraftingHandler(
      this.inventory,
      this.game.stats.maxCraftIngredients,
    );
    const result = craftingHandler.combine(...this.combineItems);
    this.clearCombineItems();

    if (result) {
      this.handleSuccessfulCombination(result);
    } else {
      this.handleFailedCombination();
    }
  }

  /**
   * Handles the result of a successful item combination.
   * @param newItem - The new item created as a result of the combination.
   */
  private handleSuccessfulCombination(newItem: ItemObject): void {
    this.inventory.add(newItem);
    this.showCraftedItem(newItem);
    if (this.display) this.display.items = this.inventory.items;
  }

  /**
   * Handles the result of an unsuccessful item combination.
   *
   * Removes any existing display of a crafted item.
   */
  private handleFailedCombination(): void {
    this.removeCraftedItemDisplay();
  }

  /**
   * Toggles an item for combination in the crafting interface.
   *
   * If the item is already in the list of items to combine, it is removed.
   * Otherwise, it is added to the list.
   * @param item - The item to toggle.
   */
  private toggleItemForCombination(item: ItemObject): void {
    const index = this.combineItems.indexOf(item);
    if (index !== -1) {
      this.combineItems.splice(index, 1);
    } else {
      this.combineItems.push(item);
    }
  }

  /**
   * Closes the crafting screen with a fade-out animation and removes it from the stack.
   *
   * @param stack - The stack of screens.
   */
  private closeScreen(stack: Stack): void {
    this.fadeOutCraftingScreen();
    stack.pop();
  }

  /**
   * Returns true if the crafted item display is visible, otherwise false.
   *
   * This is used to determine if the crafted item display is a modal that
   * blocks user input.
   * @return True if the screen is modal, otherwise false.
   */
  private isCraftedItemScreenShown(): boolean {
    return !!this.craftedItemDisplay;
  }

  /**
   * Shows the crafted item on the screen.
   *
   * Removes any existing display of the crafted item and creates a new
   * display element for the given item. The new display element is then
   * added to the 'canvas-container' element.
   *
   * @param item - The item to display.
   * @return A promise that resolves when the display is added to the DOM.
   */
  private async showCraftedItem(item: ItemObject): Promise<void> {
    if (this.craftedItemDisplay) this.craftedItemDisplay.remove();

    const container = document.getElementById(
      'canvas-container',
    ) as HTMLCanvasElement;
    if (container) {
      this.craftedItemDisplay = document.createElement(
        'crafted-item-display',
      ) as CraftedItemDisplay;
      this.craftedItemDisplay.itemToDisplay = item;
      container.appendChild(this.craftedItemDisplay);
    }
  }

  /**
   * Removes the crafted item display.
   */
  private async removeCraftedItemDisplay(): Promise<void> {
    if (this.craftedItemDisplay) {
      await this.craftedItemDisplay.fadeOut();
      this.craftedItemDisplay = null;
    }

    if (this.display) this.display.style.display = 'block';
  }
}
