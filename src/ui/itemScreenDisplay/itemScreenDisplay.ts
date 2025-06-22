export class ItemScreenDisplay extends HTMLElement {
  public itemDescription: string = '';
  public options: { key: string; description: string }[] = [];
  private menuKey: string = 'Esc';

  constructor() {
    super();
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const template = document.createElement('template');
    template.innerHTML = `
        <style>
          :host {
           --outer-margin: 6rem;
           --minimal-width: 33%;
           --maximal-width: 100%;
         }
          .item-display-card {
            background: var(--popupBackground);
            position: absolute;
            top: 1rem;
            left: 1rem;
            padding: 2rem;
            border-radius: 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: calc(var(--maximal-width) - var(--outer-margin));
            width: calc(var(--minimal-width) - var(--outer-margin));
            color: var(--white);
          }
          .item-description {
            font-size: 1.5rem;
            margin-bottom: 2rem;
          }
          .options {
            list-style: none;
            padding: 0;
          }
          .options li {
            margin: 0.5rem 0;
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
        </style>
        <div class="item-display-card">
          <div class="item-description"></div>
          <ul class="options"></ul>
          <div class="inventory-footing">(Press ${this.menuKey} to cancel)</div>
        </div>
      `;
    shadowRoot.appendChild(template.content.cloneNode(true));

    this.generateOptionsList();
  }
  /**
   * Sets the menu key text displayed in the heading.
   *
   * @param key - The menu key.
   */
  set menuKeyText(key: string) {
    this.menuKey = key;
    const footing = this.shadowRoot?.querySelector(
      '.inventory-footing',
    ) as HTMLElement;
    if (footing) footing.textContent = `(Press ${this.menuKey} to close)`;
  }

  /**
   * Generates and populates the options list in the item screen display.
   */
  private generateOptionsList(): void {
    if (!this.shadowRoot) return;

    const descriptionElement =
      this.shadowRoot.querySelector('.item-description');
    const optionsList = this.shadowRoot.querySelector('.options');

    if (descriptionElement) {
      descriptionElement.textContent = `Do what with ${this.itemDescription}?`;
    }

    if (optionsList) {
      optionsList.innerHTML = '';
      this.options.forEach(option => {
        const li = document.createElement('li');
        const keyDescMsg = `${option.key} - ${option.description}`;
        const descOnlyMsg = ` ${option.description}`;
        li.textContent = option.key ? keyDescMsg : descOnlyMsg;
        optionsList.appendChild(li);
      });
    }
  }

  /**
   * Triggers a fade-out animation and resolves when it completes.
   *
   * @returns A promise that resolves when the fade-out animation completes.
   */
  public fadeOut(): Promise<void> {
    return new Promise(resolve => {
      this.classList.add('fade-out');
      this.addEventListener('animationend', () => resolve(), { once: true });
    });
  }
}
