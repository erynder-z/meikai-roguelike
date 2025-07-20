import mobData from '../gameLogic/mobs/mobData/mobs.json';
import { UnBlurElement } from '../ui/other/unBlurElement';

export class HelpMobs extends UnBlurElement {
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

        }

        th, td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid var(--whiteTransparent);
        }

        th {
          background-color: var(--whiteTransparent);
        }

        tbody {
        font: 1rem DejaVu Sans Mono, monospace;
        }

        .mob-cell {
          font-size: 1.75rem;
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
            <tr>
              <th>Mob</th>
              <th>Name</th>
              <th>About</th>
            </tr>
          </thead>
          <tbody id="mob-list">
          <!-- Mobs will be mapped here -->
          </tbody>
        </table>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));

    super.connectedCallback();
    this.populateMobsList();
    this.unBlur();
  }

  /**
   * Populates the list of mobs in the help page.
   *
   * This function is called once, when the component is first created.
   * It reads the mob data from the JSON file and creates a table row
   * for each mob, with the mob's character, name, and description.
   * The table rows are then appended to the table element.
   */
  private populateMobsList(): void {
    const mobListElement = this.shadowRoot?.querySelector(
      '#mob-list',
    ) as HTMLTableSectionElement;

    mobData.mobs
      .filter(mob => mob.help.show)
      .forEach(mob => {
        const rowElement = document.createElement('tr');

        const mobCellElement = this.createTableCell('mob-cell');
        const nameCellElement = this.createTableCell('name-cell');
        const aboutCellElement = this.createTableCell('about-cell');

        const characterSpan = document.createElement('span');
        characterSpan.textContent = mob.char;
        characterSpan.style.display = 'inline-block';
        characterSpan.style.width = '2ch';
        characterSpan.style.height = '2ch';
        characterSpan.style.textAlign = 'center';
        characterSpan.style.backgroundColor = 'var(--whiteTransparent)';
        characterSpan.style.color = mob.fgCol;

        mobCellElement.appendChild(characterSpan);

        nameCellElement.textContent = mob.name;
        aboutCellElement.textContent = mob.help.about;

        rowElement.append(mobCellElement, nameCellElement, aboutCellElement);
        mobListElement.appendChild(rowElement);
      });
  }

  /**
   * Creates a table cell element with the given class name.
   *
   * @param className - The class name to add to the created element.
   * @return The created table cell element.
   */
  private createTableCell(className: string): HTMLTableCellElement {
    const cellElement = document.createElement('td');
    cellElement.classList.add(className);
    return cellElement;
  }
}
