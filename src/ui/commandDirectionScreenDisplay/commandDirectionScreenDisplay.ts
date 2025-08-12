import { FadeInOutElement } from '../other/fadeInOutElement';

export class CommandDirectionScreenDisplay extends FadeInOutElement {
  public title: string = '';
  public directions: string[][] = [];

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
            --minimal-width: 70ch;
            --maximal-width: 100%;
          }

          .command-direction-screen-display {
            backdrop-filter: brightness(50%);
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 100%;
            width: 100%;
          }

          .menu-card {
            background: var(--commandDirectionScreenBackground);
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
            justify-content: center;
            color: var(--white);
            overflow-y: auto;
            overflow-x: hidden;
          }

          .title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }
          .directions-table {
            display: grid;
            grid-template-columns: repeat(5, auto);
            gap: 0.5rem;
          }
          .cell {
            text-align: center;
            padding: 0.5rem;
            background: var(--cellBackground);
            border-radius: 0.25rem;
          }
        </style>
        <div class="command-direction-screen-display">
          <div class="menu-card">
            <div class="title"></div>
            <div class="directions-table"></div>
          </div>
        </div>
      `;
    shadowRoot.appendChild(template.content.cloneNode(true));

    super.connectedCallback();
    this.renderDirections();
    this.fadeIn();
  }

  /**
   * Renders the direction table and title.
   */
  private renderDirections(): void {
    if (!this.shadowRoot) return;

    const titleElement = this.shadowRoot.querySelector('.title');
    const tableElement = this.shadowRoot.querySelector('.directions-table');

    if (titleElement) {
      titleElement.textContent = this.title;
    }

    if (tableElement) {
      tableElement.innerHTML = '';
      this.directions.forEach(row => {
        row.forEach(cell => {
          const cellElement = document.createElement('div');
          cellElement.className = 'cell';
          cellElement.textContent = cell;
          tableElement.appendChild(cellElement);
        });
      });
    }
  }
}
