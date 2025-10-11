import { ItemObject } from '../../gameLogic/itemObjects/itemObject';
import keysJson from '../../utilities/commonKeyboardChars.json';
import { groupInventory } from '../../utilities/inventoryUtils';
import { KeypressScrollHandler } from '../../utilities/KeypressScrollHandler';
import { FadeInOutElement } from '../other/fadeInOutElement';

export class CraftingScreenDisplay extends FadeInOutElement {
  private inventoryItems: ItemObject[] = [];
  private combinedItems: ItemObject[] = [];
  private maxNoOfIngredients: number = 2;

  constructor() {
    super();
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const templateElement = document.createElement('template');
    templateElement.innerHTML = `
      <style>
        :host {
          --outer-margin: 6rem;
          --minimal-width: 70ch;
          --maximal-width: 100%;
        }

        ::-webkit-scrollbar {
          width: 0.25rem;
        }

        ::-webkit-scrollbar-thumb {
          background-color: var(--scrollbar-foreground);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-track {
          background-color: var(--scrollbar-background);
        }

        .crafting-screen-display {
          backdrop-filter: brightness(50%);
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          height: 100%;
          width: 100%;
        }

        .menu-card {
          background: var(--craftingScreenBackground);
          position: relative;
          top: 1rem;
          left: 1rem;
          padding: 2rem 4rem;
          border-radius: 1rem;
          outline: 0.1rem solid var(--outline);
          display: flex;
          height: calc(var(--maximal-width) - var(--outer-margin));
          width: calc(var(--minimal-width) - var(--outer-margin)); 
          flex-direction: column;
          align-items: center;
          color: var(--white);
          overflow-y: auto;
          overflow-x: hidden;
        }

        .crafting-heading {
          color: var(--heading);
          font-size: 1.5rem;
          font-weight: bold;
          text-align: center;
          letter-spacing: 0.5rem;
          margin-bottom: 1rem;
        }

        .crafting-message-container {
          width: 100%;
          min-height: 7ch;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 1.25rem;
          font-weight: bold;
          color: var(--white);
          text-align: center;
        }

        .crafting-message {
          padding: 1rem;
          width: 100%;
        }

        .craft-button {
          padding: 1rem;
          width: 100%;
          background: none;
          font: inherit;
          font-size: 1.5rem;
          color: var(--textGood);
          border: none;
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }

        .inventory-list {
          width: 100%;
          width: 100%;
          display: flex;
          overflow: auto;
          margin-bottom: 1rem;
        }

        .inventory-list ul {
          padding: 0;
          width: 100%;
        }

        .inventory-list ul li {
          list-style-type: none;
        }

        .selectedItem {
          color: var(--selected);
        }

        .bad {
          color: var(--textBad);
        }

        .hidden {
          display: none;
        }
      </style>

      <div class="crafting-screen-display">
      <div class="menu-card">
        <div class="crafting-heading">Item Crafting</div>
        <div class="crafting-message-container">
          <div class="crafting-message bad hidden"></div>
          <button class="craft-button hidden">Combine (+)</button>
        </div>
        <div class="inventory-list"></div>
        </div>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
    super.connectedCallback();
    this.fadeIn();
  }

  /**
   * Sets the inventory items to display.
   *
   * @param items - The inventory items.
   */
  set items(items: ItemObject[]) {
    this.inventoryItems = items;
    this.renderInventoryList();
    this.updateCraftingActionDisplay();
  }

  /**
   * Sets the items to be combined.
   *
   * @param items - The items to combine.
   */
  set combined(items: ItemObject[]) {
    this.combinedItems = items;
    this.renderInventoryList();
    this.updateCraftingActionDisplay();
  }

  /**
   * Sets the maximum number of items that can be combined at once.
   *
   * @param maxIngredients - The new maximum number of items that can be combined.
   */
  set maxIngredients(maxIngredients: number) {
    this.maxNoOfIngredients = maxIngredients;
  }

  /**
   * Handles virtual scrolling via keypress.
   *
   * @param event - The keyboard event.
   */
  public handleVirtualScroll(event: KeyboardEvent): void {
    const scrollContainer = this.shadowRoot?.querySelector(
      '.inventory-list',
    ) as HTMLElement;
    if (scrollContainer)
      new KeypressScrollHandler(scrollContainer).handleVirtualScroll(event);
  }

  /**
   * Renders the inventory list items.
   */
  private renderInventoryList(): void {
    const isItemSelected = (item: ItemObject) =>
      this.combinedItems.includes(item);

    const inventoryListContainer = this.shadowRoot?.querySelector(
      '.inventory-list',
    ) as HTMLElement;
    if (inventoryListContainer) {
      inventoryListContainer.innerHTML = '';
      const itemList = document.createElement('ul');
      const fragment = document.createDocumentFragment();
      const groupedItems = groupInventory(this.inventoryItems);

      groupedItems.forEach((groupedItem, index) => {
        const key = index < keysJson.keys.length ? keysJson.keys[index] : '?';
        const listItem = document.createElement('li');
        const count = groupedItem.count > 1 ? ` x${groupedItem.count}` : '';
        listItem.textContent = `${key}: ${groupedItem.item.description()}${count}`;
        listItem.dataset.index = this.inventoryItems
          .indexOf(groupedItem.item)
          .toString();
        if (isItemSelected(groupedItem.item))
          listItem.classList.add('selectedItem');

        fragment.appendChild(listItem);
      });

      itemList.appendChild(fragment);
      inventoryListContainer.appendChild(itemList);
    }
  }

  /**
   * Updates the visibility of the 'Craft' button and the crafting message.
   */
  private updateCraftingActionDisplay(): void {
    const craftButton = this.shadowRoot?.querySelector(
      '.craft-button',
    ) as HTMLElement;
    const craftingMessage = this.shadowRoot?.querySelector(
      '.crafting-message',
    ) as HTMLElement;

    if (!craftButton || !craftingMessage) return;

    const canCraft = this.canCombineItems();

    this.toggleElementsVisibility(craftButton, craftingMessage, canCraft);

    if (!canCraft) this.updateCraftingMessage(craftingMessage);
  }

  /**
   * Checks if the currently selected items can be combined.
   * @returns True if items can be combined, otherwise false.
   */
  private canCombineItems(): boolean {
    const selectedCount = this.combinedItems.length;
    return selectedCount > 1 && selectedCount <= this.maxNoOfIngredients;
  }

  /**
   * Toggles the visibility of the craft button and message.
   * @param craftButton - The craft button element.
   * @param craftingMessage - The crafting message element.
   * @param canCraft - Whether the items can be crafted.
   */
  private toggleElementsVisibility(
    craftButton: HTMLElement,
    craftingMessage: HTMLElement,
    canCraft: boolean,
  ): void {
    craftButton.classList.toggle('hidden', !canCraft);
    craftingMessage.classList.toggle('hidden', canCraft);
  }

  /**
   * Updates the crafting message text.
   * @param craftingMessage - The crafting message element.
   */
  private updateCraftingMessage(craftingMessage: HTMLElement): void {
    const selectedCount = this.combinedItems.length;
    const message =
      selectedCount <= 1
        ? 'Select at least 2 items to combine.'
        : `You can only combine up to ${this.maxNoOfIngredients} items.`;
    craftingMessage.textContent = message;
  }
}
