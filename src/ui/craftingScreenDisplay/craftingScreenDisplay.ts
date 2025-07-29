import { FadeInOutElement } from '../other/fadeInOutElement';
import { ItemObject } from '../../gameLogic/itemObjects/itemObject';
import keysJson from '../../utilities/commonKeyboardChars.json';
import { KeypressScrollHandler } from '../../utilities/KeypressScrollHandler';

export class CraftingScreenDisplay extends FadeInOutElement {
  private inventoryItems: ItemObject[] = [];
  private combinedItems: ItemObject[] = [];

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
          visibility: hidden;
        }
      </style>

      <div class="crafting-screen-display">
        <div class="crafting-heading">
          Item crafting
        </div>
        <div class="inventory-list"></div>
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
    this.updateButtonVisibility();
  }

  /**
   * Sets the items to be combined.
   *
   * @param items - The items to combine.
   */
  set combined(items: ItemObject[]) {
    this.combinedItems = items;
    this.renderInventoryList();
    this.updateButtonVisibility();
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
   * Updates the visibility of the 'Craft' button based on the number of items selected.
   */
  private updateButtonVisibility(): void {
    const button = this.shadowRoot?.querySelector('.craft-button');
    if (this.combinedItems.length >= 2) {
      button?.classList.remove('hidden');
    } else {
      button?.classList.add('hidden');
    }
  }
}

customElements.define('crafting-screen-display', CraftingScreenDisplay);
