import { FadeInOutElement } from '../other/fadeInOutElement';

export class SpellScreenDisplay extends FadeInOutElement {
  public title: string = '';
  public spells: { key: string; description: string }[] = [];

  constructor() {
    super();
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    super.connectedCallback();
    const template = document.createElement('template');
    template.innerHTML = `
        <style>
          :host {
          --outer-margin: 6rem;
          --minimal-width: 70ch;
          --maximal-width: 100%;
          }

          .spell-screen {
            backdrop-filter: brightness(50%);
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 100%;
            width: 100%;
          }

          .menu-card {
            background: var(--spellScreenBackground);
            position: relative;
            top: 1rem;
            left: 1rem;
            padding: 2rem 4rem;
            border-radius: 1rem;
            outline: 0.1rem solid var(--outline);
            display: flex;
            height: calc(var(--maximal-width) - var(--outer-margin));
            width: calc(var(--minimal-width) - var(--outer-margin));
            flex-direction: column;
            align-items: center;
            justify-content: start;
            color: var(--white);
            overflow-y: auto;
            overflow-x: hidden;
          }

          .spell-heading {
            color: var(--heading);
            font-size: 1.5rem;
            font-weight: bold;
            text-align: center;
            letter-spacing: 0.5rem;
            margin-bottom: 1rem;
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
        </style>
        <div class="spell-screen">
          <div class="menu-card">
            <div class="spell-heading"></div>
            <ul class="spell-options"></ul>
          </div>
        </div>
      `;
    shadowRoot.appendChild(template.content.cloneNode(true));

    this.renderSpells();
    this.fadeIn();
  }

  /**
   * Renders the spell list and title in the component.
   */
  private renderSpells(): void {
    if (!this.shadowRoot) return;

    const titleElement = this.shadowRoot.querySelector('.spell-heading');
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
}
