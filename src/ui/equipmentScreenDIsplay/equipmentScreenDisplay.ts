import { FadeOutElement } from '../other/fadeOutElement';

export class EquipmentScreenDisplay extends FadeOutElement {
  private equipmentItems: {
    char: string;
    slot: string;
    description: string;
  }[] = [];
  private menuKey: string = 'Esc';

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

        .equipment-screen-display {
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
          justify-content: center;
          color: var(--white);
        }

        .equipment-heading {
          font-size: 1.5rem;
          text-align: center;
          margin-bottom: 2rem;
        }

        .equipment-list ul {
          padding: 0 2rem;
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

        .fade-out {
          animation: fade-out 100ms;
        }

        @keyframes fade-out {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      </style>
      <div class="equipment-screen-display">
        <div class="equipment-heading">Equipped Items: (Press ${this.menuKey} to close)</div>
        <div class="equipment-list"></div>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
  }

  /**
   * Sets the equipment items to display.
   *
   * @param items - An array of equipment items to display.
   */
  set items(items: { char: string; slot: string; description: string }[]) {
    this.equipmentItems = items;
    this.renderEquipmentList();
  }

  /**
   * Sets the menu key text displayed in the heading.
   *
   * @param key - The menu key.
   */
  set menuKeyText(key: string) {
    this.menuKey = key;
    const heading = this.shadowRoot?.querySelector(
      '.equipment-heading',
    ) as HTMLElement;
    if (heading) {
      heading.textContent = `Equipped Items: (Press ${this.menuKey} to close)`;
    }
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
}
