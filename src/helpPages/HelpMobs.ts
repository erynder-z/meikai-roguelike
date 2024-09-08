import mobData from './mobs.json';

export class HelpMobs extends HTMLElement {
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });

    const templateElement = document.createElement('template');
    templateElement.innerHTML = `
      <style>
        * {
          margin: var(--margin);
          padding: var(--padding);
          box-sizing: var(--box-sizing);
        }

        * {
          scrollbar-width: var(--scrollbar-width);
          scrollbar-color: var(--scrollbar-foreground) var(--scrollbar-background);
        }

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

    this.populateMobsList();
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

    mobData.mobs.forEach(mob => {
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
      aboutCellElement.textContent = mob.about;

      rowElement.append(mobCellElement, nameCellElement, aboutCellElement);
      mobListElement.appendChild(rowElement);
    });
  }

  /**
   * Creates a table cell element with the given class name.
   *
   * @param {string} className - The class name to add to the created element.
   * @return {HTMLTableCellElement} - The created table cell element.
   */
  private createTableCell(className: string): HTMLTableCellElement {
    const cellElement = document.createElement('td');
    cellElement.classList.add(className);
    return cellElement;
  }
}
