import { gameConfigManager } from '../gameConfigManager/gameConfigManager';
import environmentData from '../gameLogic/environment/environmentData/environment.json';
import { UnBlurElement } from '../ui/other/unBlurElement';

export class HelpEnvironment extends UnBlurElement {
  private gameConfig = gameConfigManager.getConfig();
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });
    const templateElement = document.createElement('template');
    templateElement.innerHTML = `
      <style>
       
        ::selection {
          color: var(--selection-color);
          background-color: var(--selection-background);
        }

         .container {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
          font-family: DejaVu Sans Mono, monospace;
        }

        .header-row th {
          font-family: UA Squared, monospace;
          font-size: 1.25rem;
        }

        th, td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid var(--whiteTransparent);
        }

        th {
          background-color: var(--whiteTransparent);
        }

        .name-cell {
          font-weight: bold;
        }

        .about-cell {
          font-style: italic;
        }
      </style>

    <div class="container">
        <table>
          <thead>
            <tr class="header-row">
              <th>Environment</th>
              <th>Name</th>
              <th>About</th>
            </tr>
          </thead>
          <tbody id="environment-list">
          <!-- Environment will be mapped here -->
          </tbody>
        </table>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));

    super.connectedCallback();
    this.populateEnvironmentList();
    this.unBlur();
  }

  /**
   * Populates the environment list table with data from environment.json.
   *
   * Loops over the environment data and creates a table row for each environment,
   * with the character in the first column, the name in the second column, and the
   * about text in the third column.
   */
  private populateEnvironmentList(): void {
    const environmentListElement = this.shadowRoot?.querySelector(
      '#environment-list',
    ) as HTMLTableSectionElement;

    environmentData.environment
      .filter(env => env.help.show)
      .forEach(env => {
        const rowElement = document.createElement('tr');

        const environmentCellElement = this.createTableCell('env-cell');
        const nameCellElement = this.createTableCell('name-cell');
        const aboutCellElement = this.createTableCell('about-cell');

        const characterSpan = document.createElement('span');
        characterSpan.textContent = env.char;
        characterSpan.style.display = 'inline-flex';
        characterSpan.style.width = '2ch';
        characterSpan.style.height = '2ch';
        characterSpan.style.alignItems = 'center';
        characterSpan.style.justifyContent = 'center';
        characterSpan.style.fontFamily = `"${this.gameConfig.terminal.font}", monospace`;
        characterSpan.style.backgroundColor = env.bgCol;
        characterSpan.style.color = env.fgCol;
        characterSpan.style.fontSize = '1.75rem';

        environmentCellElement.appendChild(characterSpan);

        nameCellElement.textContent = env.name;
        aboutCellElement.textContent = env.help.about;

        rowElement.append(
          environmentCellElement,
          nameCellElement,
          aboutCellElement,
        );
        environmentListElement.appendChild(rowElement);
      });
  }

  /**
   * Creates a table cell element with the specified class name.
   *
   * @param className - The class name to add to the cell element.
   * @return The newly created table cell element.
   */
  private createTableCell(className: string): HTMLTableCellElement {
    const cellElement = document.createElement('td');
    cellElement.classList.add(className);
    return cellElement;
  }
}
