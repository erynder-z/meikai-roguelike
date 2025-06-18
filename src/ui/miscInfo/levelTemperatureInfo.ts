import { UnitSettingsManager } from '../unitSettingsManager/unitSettingsManager';

export class LevelTemperatureInfo extends HTMLElement {
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

      <div class="level-temp"></div>
  `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
  }

  /**
   * Sets the level temperature text to the given temperature in degrees Celsius.
   * @param {number} temp - The temperature to display.
   */
  public setLevelTempInfo(temp: number): void {
    const tempDisplayText = `TEMP: <span class="large-font">${this.unitSettingsManager.displayTemperature(temp)}</span>`;

    const tempInfo = this.shadowRoot?.querySelector('.level-temp');

    if (tempInfo) tempInfo.innerHTML = tempDisplayText;
  }
}
