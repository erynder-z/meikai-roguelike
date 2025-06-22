import { UnitSettingsManager } from '../unitSettingsManager/unitSettingsManager';

export class LevelDepthInfo extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: 'open' });

    const templateElement = document.createElement('template');
    templateElement.innerHTML = `
    <style>
      .large-font {
        font-size: 1.25rem;
      }
    </style>

      <div class="level-depth"></div>
  `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
  }

  /**
   * Updates the level depth information element with the given depth value.
   *
   * If the given depth is 0, the element is updated with the text 'Surface'.
   * Otherwise, the depth is formatted as a negative number with the currently
   * set depth unit (meters or feet) and the result is prepended with a '-'.
   * The formatted text is then displayed in the level depth information element.
   *
   * @param depth - The depth value to display.
   */
  public setLevelDepthInfo(depth: number): void {
    const unitSettingsManager = new UnitSettingsManager();
    const depthText =
      depth === 0 ? 'Surface' : `-${unitSettingsManager.displayDepth(depth)}`;
    const depthDisplayText = `DEPTH: <span class="large-font">${depthText}</span>`;
    const depthInfo = this.shadowRoot?.querySelector('.level-depth');

    if (depthInfo) depthInfo.innerHTML = depthDisplayText;
  }
}
