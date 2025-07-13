import { FadeOutElement } from '../other/fadeOutElement';
import { ItemObject } from '../../gameLogic/itemObjects/itemObject';
import keysJson from '../../utilities/commonKeyboardChars.json';

export class InventoryScreenDisplay extends FadeOutElement {
  private inventoryItems: ItemObject[] = [];

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

        .inventory-screen-display {
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

        .inventory-heading {
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
      </style>

      <div class="inventory-screen-display">
        <div class="inventory-heading">
          Inventory
        </div>

        <div class="inventory-list"></div>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
    super.connectedCallback();
  }

  /**
   * Sets the inventory items to display.
   *
   * @param items - The inventory items.
   */
  set items(items: ItemObject[]) {
    this.inventoryItems = items;
    this.renderInventoryList();
  }

  /**
   * Renders the inventory list items.
   *
   * Clears the inventory list container, then creates a new unordered list
   * element with list items for each inventory item. The list items are assigned
   * data-index attributes with the index of the item in the inventoryItems array.
   * The list items are also assigned text content with a key (a number for the first
   * 10 items and a question mark for items after that) and the description of the item.
   */
  private renderInventoryList(): void {
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
        fragment.appendChild(listItem);
      });

      itemList.appendChild(fragment);
      inventoryListContainer.appendChild(itemList);
    }
  }
}
