import { FadeInOutElement } from '../other/fadeInOutElement';
import { groupInventory } from '../../utilities/inventoryUtils';
import { InventoryDisplayData } from '../../types/ui/inventoryDisplayData';
import { ItemObject } from '../../gameLogic/itemObjects/itemObject';
import keysJson from '../../utilities/commonKeyboardChars.json';
import { UnitSettingsManager } from '../unitSettingsManager/unitSettingsManager';

export class InventoryScreenDisplay extends FadeInOutElement {
  private inventoryItems: ItemObject[] = [];
  private equippedItemsWeight: number = 0;
  private maxCarryWeight: number = 0;
  private unitSettingsManager: UnitSettingsManager;

  constructor() {
    super();
    this.unitSettingsManager = new UnitSettingsManager();
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
          padding: 2rem 4rem;
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
          height: 100%;
          width: 100%;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .inventory-list ul {
          padding: 0;
          width: 100%;
        }

        .inventory-list ul li {
          list-style-type: none;
        }

        .inventory-weight {
          color: var(--white);
          font-size: 1.5rem;
          font-weight: bold;
          text-align: center;
          letter-spacing: 0.25rem;
          margin-bottom: 1rem;
        }

        .inventory-equipment-container {
          display: flex;
          justify-content: space-between;
          width: 100%;
        }

        .yellow {
          color: yellow;
        }

        .red {
          color: red;
        }
      </style>

      <div class="inventory-screen-display">
        <div class="menu-card">
          <div class="inventory-heading">
            Inventory
          </div>

          <div class="inventory-list"></div>
            <div class="inventory-weight"></div>
            <div class="inventory-equipment-container">
             <div class="equipment-weight"></div>
             <div class="total-weight"></div>
            </div>
          </div>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
    super.connectedCallback();
    this.fadeIn();
  }

  /**
   * Updates the inventory screen display with new data.
   *
   * @param data - An object containing the new inventory data to display.
   * @param data.items - An array of ItemObjects to display in the inventory list.
   * @param data.wornItemsWeight - The total weight of all equipped items.
   */
  public update(data: InventoryDisplayData): void {
    this.inventoryItems = data.items;
    this.equippedItemsWeight = data.wornItemsWeight;
    this.maxCarryWeight = data.maxCarryWeight;

    this.renderInventoryList();
    this.renderItemsTotalWeight();
    this.renderInventoryWeight();
    this.renderEquippedWeight();
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

  /**
   * Renders the total weight of all items in the inventory and equipped.
   */
  private renderItemsTotalWeight(): void {
    const totalWeightContainer = this.shadowRoot?.querySelector(
      '.total-weight',
    ) as HTMLElement;
    if (totalWeightContainer) {
      totalWeightContainer.innerHTML = '';

      const totalWeight =
        this.inventoryTotalWeight() + this.equippedItemsWeight;
      const displayWeight = this.unitSettingsManager.displayWeight(totalWeight);

      const color =
        totalWeight >= this.maxCarryWeight
          ? 'red'
          : totalWeight / this.maxCarryWeight > 0.8
            ? 'yellow'
            : 'white';

      totalWeightContainer.classList.remove('yellow', 'red');
      totalWeightContainer.classList.add(color);

      totalWeightContainer.textContent = `Total carry weight: ${displayWeight}`;
    }
  }

  /**
   * Renders the total weight of all items in the inventory.
   */
  private renderInventoryWeight(): void {
    const inventoryWeightContainer = this.shadowRoot?.querySelector(
      '.inventory-weight',
    ) as HTMLElement;
    if (inventoryWeightContainer) {
      inventoryWeightContainer.innerHTML = '';

      const inventoryWeight = this.inventoryTotalWeight();
      const displayWeight =
        this.unitSettingsManager.displayWeight(inventoryWeight);

      inventoryWeightContainer.textContent = `Inventory weight: ${displayWeight}`;
    }
  }

  /**
   * Renders the total weight of all items equipped.
   */
  private renderEquippedWeight(): void {
    const equippedWeightContainer = this.shadowRoot?.querySelector(
      '.equipment-weight',
    ) as HTMLElement;
    if (equippedWeightContainer) {
      equippedWeightContainer.innerHTML = '';

      const displayWeight = this.unitSettingsManager.displayWeight(
        this.equippedItemsWeight,
      );

      equippedWeightContainer.textContent = `Equipment weight: ${displayWeight}`;
    }
  }

  /**
   * Returns the total weight of all items in the inventory.
   *
   * @returns The total weight of all items in the inventory.
   */
  private inventoryTotalWeight(): number {
    const initialWeight = 0;
    const weight = this.inventoryItems.reduce(
      (totalWeight, item) => totalWeight + item.weight,
      initialWeight,
    );
    return weight;
  }
}
