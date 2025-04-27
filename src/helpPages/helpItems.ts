import itemData from '../gameLogic/itemObjects/itemData/items.json';

export class HelpItems extends HTMLElement {
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
          animation: unBlur 0.25s;
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

        .item-cell {
          font-size: 1.75rem;
        }

        .name-cell {
          font-weight: bold;
        }

        .about-cell {
          font-style: italic;
        }

        @keyframes unBlur {
        from {
          filter: blur(35px);
        }
        to {
          filter: blur(0px);
        }
      }
      </style>

    <div class="container">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Name</th>
              <th>About</th>
            </tr>
          </thead>
          <tbody id="item-list">
          <!-- Items will be mapped here -->
          </tbody>
        </table>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));

    this.populateItemsList();
  }

  private populateItemsList(): void {
    const itemListElement = this.shadowRoot?.querySelector(
      '#item-list',
    ) as HTMLTableSectionElement;

    itemData.items
      .filter(item => item.help.show)
      .forEach(item => {
        const rowElement = document.createElement('tr');

        const environmentCellElement = this.createTableCell('item-cell');
        const nameCellElement = this.createTableCell('name-cell');
        const aboutCellElement = this.createTableCell('about-cell');

        const characterSpan = document.createElement('span');
        characterSpan.textContent = item.char;
        characterSpan.style.display = 'inline-block';
        characterSpan.style.width = '2ch';
        characterSpan.style.height = '2ch';
        characterSpan.style.textAlign = 'center';
        characterSpan.style.backgroundColor = 'var(--whiteTransparent)';
        characterSpan.style.color = item.fgCol;

        environmentCellElement.appendChild(characterSpan);

        nameCellElement.textContent = item.name;
        aboutCellElement.textContent = item.help.about;

        rowElement.append(
          environmentCellElement,
          nameCellElement,
          aboutCellElement,
        );
        itemListElement.appendChild(rowElement);
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
