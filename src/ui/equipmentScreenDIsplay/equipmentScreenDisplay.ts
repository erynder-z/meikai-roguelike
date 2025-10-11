import { FadeInOutElement } from '../other/fadeInOutElement';
import { UnitSettingsManager } from '../unitSettingsManager/unitSettingsManager';

type EquipmentItemData = {
  char: string;
  slot: string;
  weight: number;
  description: string;
};

type EquipmentDisplayData = {
  items: EquipmentItemData[];
  inventoryWeight: number;
  maxCarryWeight: number;
};

export class EquipmentScreenDisplay extends FadeInOutElement {
  private equipmentItems: EquipmentItemData[] = [];
  private inventoryWeight: number = 0;
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

        .equipment-screen-display {
          backdrop-filter: brightness(50%);
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          height: 100%;
          width: 100%;
        }

        .menu-card {
          background: var(--equipmentScreenBackground);
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

        .equipment-heading {
          color: var(--heading);
          font-size: 1.5rem;
          font-weight: bold;
          text-align: center;
          letter-spacing: 0.5rem;
          margin-bottom: 1rem;  
        }

        .equipment-list {
          height: 100%;
          width: 100%;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .equipment-list ul {
          padding: 0;
        }

        .equipment-list ul li {
          list-style-type: none;
          padding: 0.5rem;
        }

        .equipment-list ul li:hover {
          background-color: var(--hover-bg-color, #222);
        }

        .no-item {
          color: var(--grayedOut);
        }

        .equipment-weight {
          color: var(--white);
          font-size: 1.5rem;
          font-weight: bold;
          text-align: center;
          letter-spacing: 0.5rem;
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
      <div class="equipment-screen-display">
        <div class="menu-card">
          <div class="equipment-heading">Equipped Items</div>
          <div class="equipment-list"></div>
          <div class="equipment-weight"></div>
            <div class="inventory-equipment-container">
             <div class="inventory-weight"></div>
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
   * Updates the equipment screen display with new data.
   *
   * @param data - An object containing the new equipment data to display.
   */
  public update(data: EquipmentDisplayData): void {
    this.equipmentItems = data.items;
    this.inventoryWeight = data.inventoryWeight;
    this.maxCarryWeight = data.maxCarryWeight;

    this.renderEquipmentList();
    this.renderTotalWeight();
    this.renderInventoryWeight();
    this.renderEquipmentWeight();
  }

  /**
   * Renders the equipment list items.
   *
   * Clears the equipment list container, then creates a new unordered list
   * element with list items for each equipment item.
   */
  private renderEquipmentList(): void {
    const equipmentListContainer = this.shadowRoot?.querySelector(
      '.equipment-list',
    ) as HTMLElement;
    if (equipmentListContainer) {
      equipmentListContainer.innerHTML = '';
      const itemList = document.createElement('ul');
      const fragment = document.createDocumentFragment();

      this.equipmentItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = `${item.char} - ${item.slot}: ${item.description}`;
        if (item.description === 'none') listItem.classList.add('no-item');

        fragment.appendChild(listItem);
      });

      itemList.appendChild(fragment);
      equipmentListContainer.appendChild(itemList);
    }
  }

  /**
   * Renders the total weight of all items in the inventory and equipped.
   */
  private renderTotalWeight(): void {
    const totalWeightContainer = this.shadowRoot?.querySelector(
      '.total-weight',
    ) as HTMLElement;
    if (totalWeightContainer) {
      totalWeightContainer.innerHTML = '';

      const totalWeight = this.getEquipmentWeight() + this.inventoryWeight;
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

      const displayWeight = this.unitSettingsManager.displayWeight(
        this.inventoryWeight,
      );

      inventoryWeightContainer.textContent = `Inventory weight: ${displayWeight}`;
    }
  }

  /**
   * Renders the total weight of all items equipped.
   */
  private renderEquipmentWeight(): void {
    const equippedWeightContainer = this.shadowRoot?.querySelector(
      '.equipment-weight',
    ) as HTMLElement;
    if (equippedWeightContainer) {
      equippedWeightContainer.innerHTML = '';

      const equipmentWeight = this.getEquipmentWeight();
      const displayWeight =
        this.unitSettingsManager.displayWeight(equipmentWeight);

      equippedWeightContainer.textContent = `Equipment weight: ${displayWeight}`;
    }
  }

  /**
   * Returns the total weight of all items equipped.
   *
   * @returns The total weight of all items equipped.
   */
  private getEquipmentWeight(): number {
    const initialWeight = 0;
    return this.equipmentItems.reduce(
      (totalWeight, item) => totalWeight + item.weight,
      initialWeight,
    );
  }
}
