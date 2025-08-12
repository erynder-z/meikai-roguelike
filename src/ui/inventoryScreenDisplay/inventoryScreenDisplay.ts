import { FadeInOutElement } from '../other/fadeInOutElement';
import { ItemObject } from '../../gameLogic/itemObjects/itemObject';
import keysJson from '../../utilities/commonKeyboardChars.json';
import { groupInventory } from '../../utilities/inventoryUtils';

export class InventoryScreenDisplay extends FadeInOutElement {
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

        .inventory-screen-display {
          backdrop-filter: brightness(50%);
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          height: 100%;
          width: 100%;
        }

        .menu-card {
          background: var(--inventoryScreenBackground);
          position: relative;
          top: 1rem;
          left: 1rem;
          padding: 2rem;
          border-radius: 1rem;
          outline: 0.1rem solid var(--outline);
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
          color: var(--heading);
          font-size: 1.5rem;
          font-weight: bold;
          text-align: center;
          letter-spacing: 0.5rem;
          margin-bottom: 1rem;
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
        <div class="menu-card">
          <div class="inventory-heading">
            Inventory
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
  }

  /**
   * Renders the inventory list items.
   *
   * Clears the inventory list container, then creates a new unordered list
   * element with list items for each inventory item.
   *
   * The key for each item is the first letter of the item's glyph, as long as
   * the item's index is within the keysJson array.
   *
   * The text content of each list item is the item's description, followed by
   * the count of the item if it is more than one.
   *
   * The 'data-index' attribute of each list item is set to the index of the
   * item in the inventoryItems array.
   */
  private renderInventoryList(): void {
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
        fragment.appendChild(listItem);
      });

      itemList.appendChild(fragment);
      inventoryListContainer.appendChild(itemList);
    }
  }
}
