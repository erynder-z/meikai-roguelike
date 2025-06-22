export class SpellScreenDisplay extends HTMLElement {
  public title: string = '';
  public spells: { key: string; description: string }[] = [];
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

          .spell-screen {
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
            justify-content: center;
            color: var(--white);
          }
          .spell-title {
            font-size: 1.5rem;
            margin-bottom: 2rem;
            text-align: center;
          }
          .spell-options {
            list-style: none;
            padding: 0;
            margin: 0;
            width: 100%;
          }
          .spell-options li {
            margin: 0.5rem 0;
            font-size: 1rem;
            text-align: left;
          }
          .spell-footing {
            margin-top: 1rem;
            font-size: 0.9rem;
            color: #ccc;
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
        <div class="spell-screen">
          <div class="spell-title"></div>
          <ul class="spell-options"></ul>
          <div class="spell-footing">(Press ${this.menuKey} to cancel)</div>
        </div>
      `;
    shadowRoot.appendChild(template.content.cloneNode(true));

    this.renderSpells();
  }

  /**
   * Sets the cancel key text displayed in the footer.
   *
   * @param key - The cancel key.
   */
  set menuKeyText(key: string) {
    this.menuKey = key;
    const footing = this.shadowRoot?.querySelector(
      '.spell-footing',
    ) as HTMLElement;
    if (footing) footing.textContent = `(Press ${this.menuKey} to cancel)`;
  }

  /**
   * Renders the spell list and title in the component.
   */
  private renderSpells(): void {
    if (!this.shadowRoot) return;

    const titleElement = this.shadowRoot.querySelector('.spell-title');
    const optionsList = this.shadowRoot.querySelector('.spell-options');

    if (titleElement) {
      titleElement.textContent = this.title;
    }

    if (optionsList) {
      optionsList.innerHTML = '';
      this.spells.forEach(spell => {
        const li = document.createElement('li');
        li.textContent = `${spell.key} - ${spell.description}`;
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
