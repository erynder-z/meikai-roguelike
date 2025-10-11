import { Buff } from '../../gameLogic/buffs/buffEnum';
import { BuffType } from '../../shared-types/gameLogic/buffs/buffType';
import { BuffColors } from './buffColors';

export class BuffsDisplay extends HTMLElement {
  constructor(public colorizer: BuffColors = new BuffColors()) {
    super();
  }

  /**
   * Sets up the element's shadow root and styles it with a template.
   * This method is called when the element is inserted into the DOM.
   * It is called after the element is created and before the element is connected
   * to the DOM.
   *
   */
  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const templateElement = document.createElement('template');
    templateElement.innerHTML = `
      <style>
        ::selection {
          color: var(--selection-color);
          background-color: var(--selection-background);
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

        .buffs-display {
          overflow: auto;
          min-height: 2rem;
        }

        ul {
          padding: 0;
          margin: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        li {
          list-style: none;
          padding: 0 0.5rem;
        }
      </style>


      <div class="buffs-display"></div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
  }

  /**
   * Updates the element's shadow root to display the given map of buffs.
   *
   * @param buffMap - A map of buffs to their types.
   */
  public setBuffs(buffMap: Map<Buff, BuffType>): void {
    const buffsDisplay = this.shadowRoot?.querySelector('.buffs-display');
    if (buffsDisplay) {
      buffsDisplay.innerHTML = '';

      const ulElement = document.createElement('ul');
      const fragment = document.createDocumentFragment();

      if (!buffMap.size) {
        this.displayNoBuffs(fragment);
      } else {
        this.displayBuffList(buffMap, fragment);
      }

      ulElement.appendChild(fragment);
      buffsDisplay.appendChild(ulElement);
    }
  }

  /**
   * Displays a message in the given fragment indicating that there are no buffs.
   *
   * @param fragment - The fragment to modify.
   */
  private displayNoBuffs(fragment: DocumentFragment): void {
    const listItem = document.createElement('li');
    listItem.textContent = 'No buffs';
    fragment.appendChild(listItem);
  }

  /**
   * Displays a list of buffs in the given fragment.
   *
   * @param buffMap - A map of buffs to their types.
   * @param fragment - The fragment to modify.
   *
   * This method iterates over the given map of buffs and creates a list item for each buff.
   * The list item's text content is set to the name of the buff with a colon and the time
   * left, or '∞' if the time left is greater than 999.
   * The list item is then colored using the colorizer and appended to the given fragment.
   */
  private displayBuffList(
    buffMap: Map<Buff, BuffType>,
    fragment: DocumentFragment,
  ): void {
    buffMap.forEach((buff, key) => {
      const listItem = document.createElement('li');
      const remainTime = buff.timeLeft;
      const displayRemainTime = remainTime > 999 ? '∞' : remainTime; // display '∞' if the remain time is a large number, i.e. the buff iks meant to last until a certain condition is met.
      listItem.textContent = `${Buff[key]}: ${displayRemainTime}`;

      this.colorizer.colorBuffs(listItem);
      fragment.appendChild(listItem);
    });
  }
}
