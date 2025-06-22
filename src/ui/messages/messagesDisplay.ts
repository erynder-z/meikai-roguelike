import { BuffColors } from '../buffs/buffColors';
import { LogMessage } from '../../gameLogic/messages/logMessage';

export class MessagesDisplay extends HTMLElement {
  private colorizer: BuffColors;
  private previousRenderedMessages: Set<string>;

  constructor() {
    super();
    this.colorizer = new BuffColors();
    this.previousRenderedMessages = new Set();
  }

  /**
   * Sets up the element's shadow root and styles it with a template.
   * This method is called when the element is inserted into the DOM.
   * It is called after the element is created and before the element is connected
   * to the DOM.
   */
  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const templateElement = document.createElement('template');
    templateElement.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          padding: 0 0.5rem;
          width: 100%;
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

        .messages-display {
          overflow: auto;
        }

        h1 {
          margin: 0;
          font-size: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .messages-display ul {
          display: flex;
          flex-direction: column-reverse;
          padding: 0;
        }

        li {
          list-style: none;
          padding: 0 0.5rem;
          opacity: 0.5;
        }

        li.new-message {
          opacity: 1;
          animation: fade-in 0.2s ease-in;
        }

        @keyframes fade-in {
          from {
            opacity: 0.5;
          }

          to {
            opacity: 1;
          }
        }

        li:nth-child(odd) {
          background-color: var(--whiteTransparent);
        }
      </style>

      <h1>latest messages:</h1>
      <div class="messages-display"></div>
    `;

    shadowRoot?.appendChild(templateElement.content.cloneNode(true));
  }

  /**
   * Updates the component's display of messages by setting the innerHTML of the ".messages-display" div.
   * If a message is new (i.e. not already in the component's previousRenderedMessages Set), it is given the class "new-message".
   * The component uses requestAnimationFrame to schedule the update for the next frame.
   *
   * @param messageLog - An array of messages to display.
   */
  public setMessages(messageLog: LogMessage[]): void {
    const messagesDisplay = this.shadowRoot?.querySelector('.messages-display');
    if (!messagesDisplay) return;

    const ulElement = document.createElement('ul');
    const fragment = document.createDocumentFragment();

    messageLog.forEach(m => {
      const liElement = document.createElement('li');
      liElement.textContent = m.message;

      const messageId = m.id.toString();

      if (!this.previousRenderedMessages.has(messageId)) {
        liElement.classList.add('new-message');
        this.previousRenderedMessages.add(messageId);
      }

      this.colorizer.colorBuffs(liElement);
      fragment.appendChild(liElement);
    });

    requestAnimationFrame(() => {
      messagesDisplay.innerHTML = '';
      ulElement.appendChild(fragment);
      messagesDisplay.appendChild(ulElement);
    });
  }
}
