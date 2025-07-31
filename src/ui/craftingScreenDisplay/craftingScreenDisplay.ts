import { FadeInOutElement } from '../other/fadeInOutElement';
import { ItemObject } from '../../gameLogic/itemObjects/itemObject';
import keysJson from '../../utilities/commonKeyboardChars.json';
import { KeypressScrollHandler } from '../../utilities/KeypressScrollHandler';

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
           --minimal-width: 33%;
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
          background: var(--popupBackground);
          position: absolute;
          top: 1rem;
          left: 1rem;
          padding: 2rem;
          border-radius: 1rem;
          display: flex;
          height: calc(var(--maximal-width) - var(--outer-margin));
          width: calc(var(--minimal-width) - var(--outer-margin));
          flex-direction: column;
          align-items: center;
          justify-content: start;
          color: var(--white);
          overflow-y: auto;
          overflow-x: hidden;
        }

        .crafting-heading {
          font-size: 1.5rem;
          text-align: center;
          margin-bottom: 2rem;
        }

        .inventory-list {
          width: 100%;
        }

        .inventory-list ul {
          padding: 0 2rem;
          width: 100%;
        }

        .inventory-list ul li {
          list-style-type: none;
        }

        .selectedItem {
          color: red;
        }

        .crafting-message {
          padding: 1rem;
          margin-top: auto;
          width: 100%;
          font-size: 1.25rem;
          font-weight: bold;
          color: var(--white);
          text-align: center;
        }

        .craft-button {
          padding: 1rem;
          margin-top: auto;
          width: 100%;
          font-size: 1.25rem;
          font-weight: bold;
          background: var(--whiteTransparent);
          color: var(--white);
          border: none;
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }

        .hidden {
          display: none;
        }
      </style>

      <div class="crafting-screen-display">
        <div class="crafting-heading">
          Item crafting
        </div>
        <div class="inventory-list"></div>
        <div class="crafting-message hidden"></div>
        <button class="craft-button hidden">Combine selected items (+)</button>
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
      '.crafting-screen-display',
    ) as HTMLElement;
    if (scrollContainer) {
      new KeypressScrollHandler(scrollContainer).handleVirtualScroll(event);
    }
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

      this.inventoryItems.forEach((item, index) => {
        const key = index < keysJson.keys.length ? keysJson.keys[index] : '?';
        const listItem = document.createElement('li');
        listItem.textContent = `${key}: ${item.description()}`;
        listItem.dataset.index = index.toString();
        if (isItemSelected(item)) listItem.classList.add('selectedItem');

        fragment.appendChild(listItem);
      });

      itemList.appendChild(fragment);
      inventoryListContainer.appendChild(itemList);
    }
  }

  /**
   * Updates the visibility of the 'Craft' button and the crafting message based on the number of items selected.
   */
  private updateCraftingActionDisplay(): void {
    const craftButton = this.shadowRoot?.querySelector('.craft-button');
    const craftingMessage = this.shadowRoot?.querySelector(
      '.crafting-message',
    ) as HTMLElement;

    if (!craftButton || !craftingMessage) {
      return;
    }

    const selectedCount = this.combinedItems.length;

    if (selectedCount > 1 && selectedCount <= this.maxNoOfIngredients) {
      craftButton.classList.remove('hidden');
      craftingMessage.classList.add('hidden');
    } else {
      craftButton.classList.add('hidden');
      craftingMessage.classList.remove('hidden');

      if (selectedCount <= 1) {
        craftingMessage.textContent = 'Select at least 2 items to combine.';
      } else {
        craftingMessage.textContent = `You can only combine up to ${this.maxNoOfIngredients} items.`;
      }
    }
  }
}
