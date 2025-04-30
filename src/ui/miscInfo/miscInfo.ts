export class MiscInfo extends HTMLElement {
  constructor() {
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
      .misc-info {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 1rem;
        padding: 0 1rem;
      }

      .some-other-info {
        font-size: large;
      }

      .level-info {
        font-size: large;
      }

      .yellow-hp {
        color: yellow;
      }

      .red-hp {
        color: red;
      }
    </style>

    <div class="misc-info">
      <div class="some-other-info"></div>
      <div class="level-info"></div>
    </div>
  `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
  }

  /**
   * Sets the level text to the given level.
   *
   * @param {number} lvl - The level to display.
   * @returns {void}
   */
  public setLevelInfo(lvl: number): void {
    const lvlDisplayText = `LVL: ${lvl}`;

    const levelInfo = this.shadowRoot?.querySelector('.level-info');

    if (levelInfo) levelInfo.innerHTML = lvlDisplayText;
  }
}
