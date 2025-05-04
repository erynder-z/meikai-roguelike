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
      <div class="player-hp-status">Health: </div>
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
    const lvlDisplayText = `LVL: <span class="large-font">${lvl}</span>`;

    const levelInfo = this.shadowRoot?.querySelector('.level-info');

    if (levelInfo) levelInfo.innerHTML = lvlDisplayText;
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
