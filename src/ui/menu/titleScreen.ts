import img01 from '../../assets/images/title/title01.webp';
import img02 from '../../assets/images/title/title02.webp';
import img03 from '../../assets/images/title/title03.webp';
import img04 from '../../assets/images/title/title04.webp';
import img05 from '../../assets/images/title/title05.webp';
import img06 from '../../assets/images/title/title06.webp';

export class TitleScreen extends HTMLElement {
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
    const images = [img01, img02, img03, img04, img05, img06];

    const img = images[Math.floor(Math.random() * images.length)];

    const shadowRoot = this.attachShadow({ mode: 'open' });

    const templateElement = document.createElement('template');
    templateElement.innerHTML = `
      <style>
        .title-screen {
          font-family: 'UA Squared';
          font-size: 2.5rem;
          position: absolute;
          height: 100%;
          width: 100%;
          background: var(--backgroundDefault);
          color: var(--white);
          z-index: 1;
          overflow: hidden;
        }

        .background-image {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          background-image: url('${img}');
          background-size: cover;
          background-position: left;
          animation: pan 25s infinite linear;
          z-index: -1;
        }

        .content {
          height: 100%;
          width: 100%;
        }

        @keyframes pan {
          0% {
            background-position: left;
          }
          50% {
            background-position: right;
          }
          100% {
            background-position: left;
          }
        }
      </style>

      <div class="title-screen">
        <div class="background-image"></div>
        <div id="title-screen-content" class="content">
          <title-menu></title-menu>
        </div>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));

    this.addEventListener('player-setup', this.handlePlayerSetup);
  }

  /**
   * Handles the 'player-setup' event by replacing the content of the title screen
   * with a player setup element. This function is called when the user clicks
   * the "start a new game" button on the title screen.
   */
  private handlePlayerSetup(): void {
    const titleScreenContent = this.shadowRoot?.getElementById(
      'title-screen-content',
    );
    if (titleScreenContent) {
      titleScreenContent.innerHTML = '';
      const playerSetup = document.createElement('player-setup');
      titleScreenContent.appendChild(playerSetup);
    }
  }
}
