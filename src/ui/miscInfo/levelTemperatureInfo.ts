import { UnitSettingsManager } from '../unitSettingsManager/unitSettingsManager';

export class LevelTemperatureInfo extends HTMLElement {
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

      <div class="level-temp"></div>
  `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
  }

  /**
   * Sets the temperature information element to the given temperature value.
   * Converts the temperature to the currently set unit before displaying it.
   *
   * @param temp - The temperature in Celsius to display.
   */
  public setLevelTempInfo(temp: number): void {
    const unitSettingsManager = new UnitSettingsManager();
    const tempDisplayText = `TEMP: <span class="large-font">${unitSettingsManager.displayTemperature(temp)}</span>`;

    const tempInfo = this.shadowRoot?.querySelector('.level-temp');

    if (tempInfo) tempInfo.innerHTML = tempDisplayText;
  }
}
