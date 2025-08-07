import { FadeInOutElement } from '../other/fadeInOutElement';
import { ItemObject } from '../../gameLogic/itemObjects/itemObject';

export class CraftedItemDisplay extends FadeInOutElement {
  private item: ItemObject | null = null;

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

        .crafted-item-display {
          background: var(--popupBackground);
          position: absolute;
          top: 1rem;
          left: var(--minimal-width);
          padding: 2rem;
          border-radius: 1rem;
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

        .item-details {
          width: 100%;
          padding: 0 2rem;
        }

        .item-details ul {
          padding: 0;
          width: 100%;
        }

        .item-details ul li {
          list-style-type: none;
          margin-bottom: 0.5rem;
        }
      </style>

      <div class="crafted-item-display">
        <div class="crafting-heading">New Item Crafted</div>
        <div class="item-details"></div>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
    super.connectedCallback();
    this.fadeIn();

    requestAnimationFrame(() => {
      if (this.item) {
        this.renderItemDetails();
      }
    });
  }

  /**
   * Sets the item to display.
   *
   * @param item - The item object.
   */
  set itemToDisplay(item: ItemObject) {
    this.item = item;
  }

  /**
   * Renders the item details.
   */
  private renderItemDetails(): void {
    const itemDetailsContainer = this.shadowRoot?.querySelector(
      '.item-details',
    ) as HTMLElement;

    console.log(itemDetailsContainer);
    if (itemDetailsContainer && this.item) {
      itemDetailsContainer.innerHTML = '';
      const itemList = document.createElement('ul');
      const fragment = document.createDocumentFragment();

      const nameItem = document.createElement('li');
      nameItem.textContent = `Name: ${this.item.description()}`;
      fragment.appendChild(nameItem);

      itemList.appendChild(fragment);
      itemDetailsContainer.appendChild(itemList);
    }
  }
}
