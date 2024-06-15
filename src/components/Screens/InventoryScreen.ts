import { GameIF } from '../Builder/Interfaces/GameIF';
import { Inventory } from '../Inventory/Inventory';
import { ItemObject } from '../ItemObjects/ItemObject';
import { Stack } from '../Terminal/Interfaces/Stack';
import { BaseScreen } from './BaseScreen';
import { ScreenMaker } from './Interfaces/ScreenMaker';
import { ItemScreen } from './ItemScreen';

/**
 * Represents an inventory screen.
 */
export class InventoryScreen extends BaseScreen {
  name = 'inventory-screen';
  constructor(
    game: GameIF,
    make: ScreenMaker,
    public inventory: Inventory = <Inventory>game.inventory,
  ) {
    super(game, make);
    this.inventory = <Inventory>game.inventory;
  }

  /**
   * Converts position to character.
   * @param {number} pos - The position to convert.
   * @returns {string} The corresponding character.
   */
  positionToCharacter(pos: number): string {
    return String.fromCharCode(97 + pos);
  }

  /**
   * Converts character to position.
   * @param {string} c - The character to convert.
   * @returns {number} The corresponding position.
   */
  characterToPosition(c: string): number {
    let pos = c.charCodeAt(0) - 'a'.charCodeAt(0);
    if (pos < 0 || pos >= this.inventory.length()) {
      pos = -1;
    }
    return pos;
  }

  /**
   * Draws the inventory screen.
   */
  drawScreen() {
    const existingInventoryScreen = document.getElementById('inventory-screen');
    if (existingInventoryScreen) {
      return;
    }

    const inventoryScreenElement = this.createInventoryScreenElement();
    const canvasContainer = document.getElementById('canvas-container');
    canvasContainer?.appendChild(inventoryScreenElement);
  }

  private createInventoryScreenElement(): HTMLDivElement {
    const inventoryScreenElement = document.createElement('div');
    inventoryScreenElement.id = 'inventory-screen';
    inventoryScreenElement.classList.add('inventory-screen', 'fade-in');

    const titleElement = this.createTitleElement();
    const inventoryListElement = this.createInventoryListElement();

    inventoryScreenElement.appendChild(titleElement);
    inventoryScreenElement.appendChild(inventoryListElement);

    return inventoryScreenElement;
  }

  /**
   * Fades out the inventory screen by adding the 'fade-out' class to the element with the ID 'inventory-screen'.
   *
   * @return {void} This function does not return anything.
   */
  private fadeOutInventoryScreen(): void {
    const inventoryScreenElement = document.getElementById('inventory-screen');
    if (inventoryScreenElement)
      inventoryScreenElement.classList.add('fade-out');
  }

  /**
   * Creates an HTML heading element with the text content 'Inventory:'.
   *
   * @return {HTMLHeadingElement} The created HTML heading element.
   */
  private createTitleElement(): HTMLHeadingElement {
    const titleElement = document.createElement('h1');
    titleElement.textContent = 'Inventory: (press i to close.)';
    return titleElement;
  }

  /**
   * Creates an HTML unordered list element containing a list of inventory items.
   *
   * @return {HTMLUListElement} The created inventory list element.
   */
  private createInventoryListElement(): HTMLUListElement {
    const inventoryListElement = document.createElement('ul');

    this.inventory.items.forEach((item, index) => {
      const listItem = this.createListElement(item, index);
      inventoryListElement.appendChild(listItem);
    });

    return inventoryListElement;
  }

  /**
   * Creates a list element for the inventory list.
   *
   * @param {ItemObject} item - The item object to display.
   * @param {number} index - The index of the item in the list.
   * @return {HTMLLIElement} The created list element.
   */
  private createListElement(item: ItemObject, index: number): HTMLLIElement {
    const listItem = document.createElement('li');
    const character = this.positionToCharacter(index);
    listItem.textContent = `${character}: ${item.description()}`;
    return listItem;
  }

  /**
   * Handles key down events.
   * @param {KeyboardEvent} event - The keyboard event.
   * @param {Stack} stack - The stack interface.
   * @returns {boolean} - True if the event was handled successfully, otherwise false.
   */
  handleKeyDownEvent(event: KeyboardEvent, stack: Stack): boolean {
    const pos = this.characterToPosition(event.key);
    if (pos >= 0) {
      this.fadeOutInventoryScreen();
      this.itemMenu(pos, stack);
    } else {
      if (event.key === 'i') {
        this.fadeOutInventoryScreen();
        stack.pop();
        return true;
      }
    }
    return false;
  }

  /**
   * Opens the item menu.
   * @param {number} pos - The position of the item.
   * @param {Stack} stack - The stack interface.
   */
  itemMenu(pos: number, stack: Stack): void {
    const item: ItemObject = this.inventory.items[pos];
    stack.pop();
    stack.push(new ItemScreen(item, pos, this.game, this.make));
  }
}
