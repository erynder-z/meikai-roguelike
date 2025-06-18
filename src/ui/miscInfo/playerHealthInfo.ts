import { Mob } from '../../gameLogic/mobs/mob';

export class PlayerHealthInfo extends HTMLElement {
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

      .yellow-hp {
        color: yellow;
      }

      .red-hp {
        color: red;
      }
    </style>

      <div class="player-hp-status">Health: </div>
  `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
  }

  /**
   * Sets the player's HP status text in the misc info display
   * based on their current HP percentage.
   *
   * @param {Mob} player - The player mob.
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
