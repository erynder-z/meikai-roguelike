import { MessageLog } from '../../gameLogic/messages/messageLog';
import { GameState } from '../../types/gameBuilder/gameState';
import { handleLastMoments } from '../../utilities/handleLastMoments';
import { PostMortem } from '../postMortem/postMortem';

export class GameOverScreenDisplay extends HTMLElement {
  public game: GameState | null = null;
  public playerName: string = '';
  public playerColor: string = '';
  public info: string = '';
  public log: MessageLog | null = null;

  constructor() {
    super();
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const template = document.createElement('template');
    template.innerHTML = `
      <style>
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

        .game-over-screen {
          font-family: 'UA Squared';
          font-size: large;
          background: var(--backgroundDefaultTransparent);
          backdrop-filter: blur(5px);
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .player-name {
          text-align: center;
          font-size: 2rem;
          color: ${this.playerColor};
        }

        .death-message {
          font-size: 1.5em;
        }

        .last-moments-message {
          margin-top: 1rem;
        }

        .last-messages {
          list-style: none;
          font-weight: bold;
          padding: 0;
          text-align: center;
        }

        .post-mortem-container {
          padding: 1em;
        }

        .footer {
          font-size: 2rem;
          margin-top: 1rem;
        }

        .emphasize {
          color: var(--accent);
        }

        .fade-out {
          animation: fade-out 100ms;
        }

        @keyframes fade-out {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      </style>
      <div class="game-over-screen">
        <div class="player-name"></div>
        <div class="death-message"></div>
        <div class="last-moments-message">Your last moments:</div>
        <ul class="last-messages"></ul>
        <div class="post-mortem-container"></div>
        <div class="footer"></div>
      </div>
    `;
    shadowRoot.appendChild(template.content.cloneNode(true));

    this.renderContent();
  }

  /**
   * Renders the game over screen content, including the player's name,
   * a death message, and post-mortem statistics. This function creates
   * a new post-mortem element, attaches the current game state to it,
   * and appends it to the post-mortem container in the shadow DOM.
   * It also updates the player's name and death message in their respective
   * elements, and sets the footer content.
   */

  private renderContent(): void {
    if (!this.shadowRoot) return;

    const playerNameElement = this.shadowRoot.querySelector(
      '.player-name',
    ) as HTMLElement;

    const deathMessageElement = this.shadowRoot.querySelector(
      '.death-message',
    ) as HTMLElement;

    const postMortemContainer = this.shadowRoot.querySelector(
      '.post-mortem-container',
    ) as HTMLElement;

    const postMortemElement = document.createElement(
      'post-mortem',
    ) as PostMortem;
    postMortemElement.game = this.game;
    postMortemContainer.appendChild(postMortemElement);

    const footerElement = this.shadowRoot.querySelector(
      '.footer',
    ) as HTMLElement;

    if (playerNameElement) playerNameElement.innerHTML = this.playerName;

    if (deathMessageElement)
      deathMessageElement.innerHTML = `Your journey has ended...`;

    if (footerElement) footerElement.innerHTML = this.info;

    if (this.log) {
      const lastMessages = handleLastMoments(this.log);
      const lastMessagesElement = this.shadowRoot.querySelector(
        '.last-messages',
      ) as HTMLElement;
      lastMessages.forEach(message => {
        const listItem = document.createElement('li');
        listItem.textContent = message.message;
        lastMessagesElement.appendChild(listItem);
      });
    }
  }
}
