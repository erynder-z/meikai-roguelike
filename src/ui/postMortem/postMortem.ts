import { GameState } from '../../shared-types/gameBuilder/gameState';

export class PostMortem extends HTMLElement {
  public game: GameState | null = null;

  constructor() {
    super();
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
        .post-mortem {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          max-width: 70ch;
          margin: auto;
          line-height: 1.25;
          font-size: 1.25em;
        }
        .heading {
          font-size: 1.5em;
          font-weight: bold;
        }
        .post-mortem ul {
          padding: 0;
        }
        .post-mortem li {
          list-style: none;
        }
        .post-mortem span {
          color: var(--postMortemAccent);
          font-weight: bold;
          font-size: 1.25em;
        }
      </style>
      <div class="post-mortem"></div>
    `;
    shadowRoot.appendChild(template.content.cloneNode(true));
    this.renderContent();
  }

  /**
   * Renders the post-mortem content using the attached GameState.
   */
  private renderContent(): void {
    if (!this.shadowRoot || !this.game) return;

    const {
      turnCounter,
      damageDealtCounter,
      damageReceivedCounter,
      mobKillCounter,
    } = this.game.stats;
    const { level } = this.game.dungeon;

    const postMortemElement = this.shadowRoot.querySelector('.post-mortem');
    if (!postMortemElement) return;

    postMortemElement.innerHTML = `
          <ul>
            <li>You survived until turn <span>${turnCounter}</span>.</li>
            <li>You reached Dungeon Level <span>${level}</span>.</li>
          </ul>
          <div class="heading">During your adventure:</div>
          <ul>
            <li>You dealt a total of <span>${damageDealtCounter}</span> damage to enemies.</li>
            <li>You received <span>${damageReceivedCounter}</span> damage from various sources.</li>
            <li>You managed to defeat <span>${mobKillCounter}</span> enemies.</li>
          </ul>
          <p>Reflect on your journey and prepare for your next adventure!</p>
        `;
  }
}
