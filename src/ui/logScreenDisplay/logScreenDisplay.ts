import { BuffColors } from '../buffs/buffColors';
import { FadeInOutElement } from '../other/fadeInOutElement';
import { LogMessage } from '../../gameLogic/messages/logMessage';

export class LogScreenDisplay extends FadeInOutElement {
  private colorizer = new BuffColors();
  private messageLog: LogMessage[] = [];

  constructor() {
    super();
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const templateElement = document.createElement('template');
    templateElement.innerHTML = `
      <style>
        :host {
          --outer-margin: 6rem;
          --minimal-width: 33%;
          --maximal-width: 100%;
        }
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

        .log-screen-display {
           background: var(--popupBackground);
           position: absolute;
           top: 1rem;
           left: 1rem;
           padding: 2rem;
           border-radius: 1rem;
           display: flex;
           height: calc(var(--maximal-width) - var(--outer-margin));
           width: calc(var(--minimal-width) - var(--outer-margin));
           flex-direction: column;
           align-items: center;
           color: var(--white);
           overflow-y: auto;
           overflow-x: hidden;
        }

        .log-screen-heading {
          font-size: 1.5rem;
          text-align: center;
          margin-bottom: 2rem;
        }

        .log-screen-list ul li:nth-child(odd) {
          background-color: var(--whiteTransparent);
        }

        .log-screen-list ul {
          padding: 0 2rem;
          height: 100%;
        }

        .log-screen-list ul li {
          list-style-type: none;
        }
      </style>
      <div class="log-screen-display">
        <div class="log-screen-heading">
          Log 
        </div>
        <div class="log-screen-list"></div>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
    super.connectedCallback();
    this.fadeIn();
  }

  /**
   * Sets the log messages and triggers a render.
   *
   * @param messages - The log messages to display.
   */
  set log(messages: LogMessage[]) {
    this.messageLog = messages;
    this.generateMessageList();
  }

  /**
   * Renders the log messages into the component.
   */
  private generateMessageList(): void {
    const logScreenList = this.shadowRoot?.querySelector(
      '.log-screen-list',
    ) as HTMLElement;
    if (logScreenList) {
      logScreenList.innerHTML = '';
      const messageList = document.createElement('ul');
      const fragment = document.createDocumentFragment();

      for (let i = this.messageLog.length - 1; i >= 0; i--) {
        const m = this.messageLog[i];
        const listItem = document.createElement('li');
        listItem.textContent = m.message;
        this.colorizer.colorBuffs(listItem);
        fragment.appendChild(listItem);
      }

      messageList.appendChild(fragment);
      logScreenList.appendChild(messageList);
    }
  }
}
