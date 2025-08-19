import { FadeInOutElement } from '../other/fadeInOutElement';

export class EquipmentScreenDisplay extends FadeInOutElement {
  private equipmentItems: {
    char: string;
    slot: string;
    weight: number;
    description: string;
  }[] = [];

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
      </style>
      <div class="equipment-screen-display">
        <div class="menu-card">
          <div class="equipment-heading">Equipped Items</div>
          <div class="equipment-list"></div>
          <div class="equipment-total-weight"></div>
        </div>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
    super.connectedCallback();
    this.fadeIn();
  }

  /**
   * Sets the equipment items to display.
   *
   * @param items - An array of equipment items to display.
   */
  set items(
    items: {
      char: string;
      slot: string;
      weight: number;
      description: string;
    }[],
  ) {
    this.equipmentItems = items;
    this.renderEquipmentList();
    this.renderEquipmentTotalWeight();
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

  private renderEquipmentTotalWeight(): void {
    const equipmentTotalWeightContainer = this.shadowRoot?.querySelector(
      '.equipment-total-weight',
    ) as HTMLElement;
    if (equipmentTotalWeightContainer) {
      equipmentTotalWeightContainer.innerHTML = '';
      const initialWeight = 0;
      const weight = this.equipmentItems.reduce(
        (totalWeight, item) => totalWeight + item.weight,
        initialWeight,
      );

      const roundedWeight = weight.toFixed(2);
      equipmentTotalWeightContainer.textContent = `Total weight: ${roundedWeight}`;
    }
  }
}
