export class PopupBoxBad extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const templateElement = document.createElement('template');
    templateElement.innerHTML = `
      <style>
          position: absolute;
          bottom: 10%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: var(--popupBackgroundGood);
          padding: 2rem 3rem;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          animation: fade-in 0.4s cubic-bezier(0.42, 0, 0.58, 1), fade-out 0.4s cubic-bezier(0.42, 0, 0.58, 1) 1.5s;
          animation-fill-mode: forwards;
          z-index: 999;
        }

        h1 {
          margin: 0;
          font-size: 1.25rem;
          color: white;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, -60%) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes fade-out {
          from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          to {
            opacity: 0;
            transform: translate(-50%, -40%) scale(0.9);
          }
        }
      </style>
      <div class="popup-container">
        <h1 class="popup-message"></h1>
      </div>
    `;

    shadowRoot?.appendChild(templateElement.content.cloneNode(true));

    setTimeout(() => {
      this.remove();
    }, 2000);
  }

  /**
   * Displays the given message in the popup box.
   * @param message - The message to display in the popup box.
   */
  public showMessage(message: string): void {
    const popupMessage = this.shadowRoot?.querySelector('.popup-message');
    if (!popupMessage) return;

    popupMessage.textContent = message;
  }
}
