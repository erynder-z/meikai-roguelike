import { GlyphMap } from '../../gameLogic/glyphs/glyphMap';
import { ItemObject } from '../../gameLogic/itemObjects/itemObject';
import { PopInFadeOutElement } from '../other/popInFadeOutElement';

export class CraftedItemDisplay extends PopInFadeOutElement {
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

        .crafted-item-card {
          position: fixed;
          top: 0;
          left: 0;
          background: var(--craftedItemBackground);
          margin: 1rem;
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
        }

        .item-details ul {
          padding: 0;
          width: 100%;
        }

        .item-details ul li {
          list-style-type: none;
          margin-bottom: 0.5rem;
        }

        .item-details .glyph {
          font-size: 4rem;
        }

        .item-details .name {
          font-size: 1.5rem;
          font-weight: bold;
        }
      </style>

      <div class="crafted-item-card">
        <div class="crafting-heading">New Item Crafted</div>
        <div class="item-details"></div>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
    super.connectedCallback();
    this.popIn();

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

    if (itemDetailsContainer && this.item) {
      itemDetailsContainer.innerHTML = '';
      const itemList = document.createElement('ul');
      const fragment = document.createDocumentFragment();

      const glyphInfo = GlyphMap.getGlyphInfo(this.item.glyph);
      const glyphChar = glyphInfo.char;
      const glyphColor = glyphInfo.fgCol;
      const charges = this.item.charges;

      const glyphElement = document.createElement('li');
      glyphElement.classList.add('glyph');
      glyphElement.style.color = glyphColor;
      glyphElement.textContent = glyphChar;
      fragment.appendChild(glyphElement);

      const nameElement = document.createElement('li');
      nameElement.classList.add('name');
      nameElement.textContent = this.item.name();
      fragment.appendChild(nameElement);

      const descriptionElement = document.createElement('li');
      descriptionElement.textContent = this.item.desc;
      fragment.appendChild(descriptionElement);

      if (charges > 1) {
        const chargesElement = document.createElement('li');
        chargesElement.textContent = `Contains ${charges} charges`;
        fragment.appendChild(chargesElement);
      }

      itemList.appendChild(fragment);

      itemDetailsContainer.appendChild(itemList);
    }
  }
}
