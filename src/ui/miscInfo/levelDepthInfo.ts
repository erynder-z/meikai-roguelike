import { UnitSettingsManager } from '../unitSettingsManager/unitSettingsManager';

export class LevelDepthInfo extends HTMLElement {
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
      .large-font {
        font-size: 1.25rem;
      }
    </style>

      <div class="level-depth"></div>
  `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
  }

  /**
   * Sets the level depth information element to the given depth value.
   * If the given depth is 0, displays 'Surface' as the depth text.
   * Otherwise, displays the depth with a negative sign and the unit 'm'.
   * @param {number} depth - The level depth to display.
   */
  public setLevelDepthInfo(depth: number): void {
    const depthText =
      depth === 0
        ? 'Surface'
        : `-${this.unitSettingsManager.displayDepth(depth)}`;
    const depthDisplayText = `DEPTH: <span class="large-font">${depthText}</span>`;
    const depthInfo = this.shadowRoot?.querySelector('.level-depth');

    if (depthInfo) depthInfo.innerHTML = depthDisplayText;
  }
}
