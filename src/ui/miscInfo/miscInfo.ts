import { Mob } from '../../gameLogic/mobs/mob';

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
        gap: 2rem;
        padding: 0 1rem;
      }

      .large-font {
        font-size: 1.25rem;
      }

      .yellow-hp {
        color: yellow;
      }

      .red-hp {
        color: red;
      }
    </style>

    <div class="misc-info">
      <div class="player-hp-status">Health: </div>
      <div class="level-depth"></div>
      <div class="level-temp"></div>
    </div>
  `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
  }

  /**
   * Sets the level depth information element to the given depth value.
   * If the given depth is 0, displays 'Surface' as the depth text.
   * Otherwise, displays the depth with a negative sign and the unit 'm'.
   * @param {number} depth - The level depth to display.
   * @returns {void}
   */
  public setLevelDepthInfo(depth: number): void {
    const depthText = depth === 0 ? 'Surface' : `-${depth}m`;
    const depthDisplayText = `DEPTH: <span class="large-font">${depthText}</span>`;
    const depthInfo = this.shadowRoot?.querySelector('.level-depth');

    if (depthInfo) depthInfo.innerHTML = depthDisplayText;
  }

  /**
   * Sets the level temperature text to the given temperature in degrees Celsius.
   * @param {number} temp - The temperature to display.
   * @returns {void}
   */
  public setLevelTempInfo(temp: number): void {
    const tempDisplayText = `TEMP: <span class="large-font">${temp}°C</span>`;

    const tempInfo = this.shadowRoot?.querySelector('.level-temp');

    if (tempInfo) tempInfo.innerHTML = tempDisplayText;
  }

  /**
   * Sets the player's HP status text in the misc info display
   * based on their current HP percentage.
   *
   * @param {Mob} player - The player mob.
   * @returns {void}
   */
  public setPlayerHPStatus(player: Mob): void {
    const hp = player.hp;
    const maxhp = player.maxhp;

    if (!hp || !maxhp) return;

    const yellowHP = hp / maxhp >= 0.25 && hp / maxhp <= 0.5;
    const redHP = hp / maxhp <= 0.25;
    const isDead = hp <= 0;

    const playerHpStatus = this.shadowRoot?.querySelector('.player-hp-status');

    if (playerHpStatus)
      playerHpStatus.innerHTML = isDead
        ? `Health: <span class="large-font red-hp">Dead</span>`
        : redHP
          ? `Health: <span class="large-font red-hp">Danger</span>`
          : yellowHP
            ? `Health: <span class="large-font yellow-hp">Caution</span>`
            : `Health: <span class="large-font">Good</span>`;
  }
}
