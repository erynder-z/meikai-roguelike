import { FadeInOutElement } from '../other/fadeInOutElement';

export class ItemScreenDisplay extends FadeInOutElement {
  public itemDescription: string = '';
  public options: { key: string; description: string }[] = [];

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

         .item-screen {
            backdrop-filter: brightness(50%);
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 100%;
            width: 100%;
          }

          .menu-card {
            background: var(--itemScreenBackground);
            position: relative;
            top: 1rem;
            left: 1rem;
            padding: 2rem;
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

          .item-heading {
            color: var(--heading);
            font-size: 1.5rem;
            font-weight: bold;
            text-align: center;
            letter-spacing: 0.5rem;
            margin-bottom: 1rem;
          }

          .options {
            list-style: none;
            padding: 0;
            margin: 0;
            width: 100%;
          }

          .options li {
            margin: 0.5rem 0;
            font-size: 1rem;
            text-align: left;
          }
        </style>
        <div class="item-screen">
            <div class="menu-card">
                <div class="item-heading"></div>
                <ul class="options"></ul>
            </div>
        </div>
      `;
    shadowRoot.appendChild(template.content.cloneNode(true));
    this.renderOptionsList();
    this.fadeIn();
  }

  /**
   * Generates and populates the options list in the item screen display.
   */
  private renderOptionsList(): void {
    if (!this.shadowRoot) return;

    const descriptionElement = this.shadowRoot.querySelector('.item-heading');
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
}
