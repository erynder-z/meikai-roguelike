import { BuffColors } from '../ui/buffs/buffColors';
import buffsData from '../gameLogic/buffs/buffData/buffs.json';

export class HelpBuffs extends HTMLElement {
  private colorizer: BuffColors;
  constructor() {
    super();
    this.colorizer = new BuffColors();

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

        .buff-cell {
          font-weight: bold;
        }

        .effect-cell {
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
              <th>Buff</th>
              <th>Effect</th>
            </tr>
          </thead>
          <tbody id="buffs-list">
          <!-- Buffs will be mapped here -->
          </tbody>
        </table>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));

    this.populateBuffsList();
  }

  /**
   * Populates the buffs list table with data from buffsData.
   *
   * Iterates over the buffsData.buffs array and creates a table row for each buff.
   * The row consists of two cells: one for the buff's name and one for its effect.
   * The name cell is colored according to the buff's type.
   */
  private populateBuffsList(): void {
    const buffsListElement = this.shadowRoot?.querySelector(
      '#buffs-list',
    ) as HTMLTableSectionElement;

    buffsData.buffs
      .filter(b => b.help.show)
      .forEach(b => {
        const rowElement = document.createElement('tr');

        const nameCellElement = this.createTableCell('buff-cell');
        const effectCellElement = this.createTableCell('effect-cell');

        nameCellElement.textContent = b.buff;
        this.colorizer.colorBuffs(nameCellElement);

        effectCellElement.textContent = b.help.about;

        rowElement.append(nameCellElement, effectCellElement);
        buffsListElement.appendChild(rowElement);
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
