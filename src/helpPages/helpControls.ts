import controlsData from './controls.json';
import controlSchemes from '../controls/control_schemes.json';
import {
  ControlSchemeName,
  ControlSchemeType,
} from '../types/controls/controlSchemeType';
import { EventListenerTracker } from '../utilities/eventListenerTracker';
import { gameConfigManager } from '../gameConfigManager/gameConfigManager';

export class HelpControls extends HTMLElement {
  private eventTracker = new EventListenerTracker();
  private gameConfig = gameConfigManager.getConfig();
  private controlSchemeName: ControlSchemeName = this.gameConfig.control_scheme;
  private availableControlSchemes = Object.keys(
    controlSchemes,
  ) as ControlSchemeName[];

  constructor() {
    super();
  }

  /**
   * Sets up the element's shadow root and styles it with a template.
   * This method is called when the element is inserted into the DOM.
   * It is called after the element is created and before the element is connected
   * to the DOM.
   *
   */
  connectedCallback(): void {
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

        .control-scheme-button-container {
          display: flex;
          margin-top: 1rem;
        }

        .control-scheme-button {
          padding: 0.5rem 1.25rem;
          background: none;
          border: none;
          color: var(--white);
          cursor: pointer;
        }

        .control-scheme-button:hover {
          background-color: var(--whiteTransparent);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 1rem;
          font-family: DejaVu Sans Mono, monospace;
        }

        th, td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid var(--whiteTransparent);
        }

        th {
          background-color: var(--whiteTransparent);
        }

        .key-cell {
          font-weight: bold;
        }

        .action-cell {
          font-style: italic;
        }

        .underline {
          text-decoration: underline;
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
        <div class="control-scheme-button-container">
          <button id="prev-scheme-button" class="control-scheme-button"><span class="underline">&lt;</span></button>
          <div id="controls-scheme-name" class="control-scheme-name">${this.controlSchemeName.toUpperCase()} - controls</div>
          <button id="next-scheme-button" class="control-scheme-button"><span class="underline">&gt;</span></button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="controls-list">
          </tbody>
        </table>
      </div>
   `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));

    this.bindEvents();
    this.populateControlsTable(this.controlSchemeName);
  }

  /**
   * Binds events to the elements inside the controls help page.
   *
   * The function binds the following events:
   * - Click event on the previous control scheme button
   * - Click event on the next control scheme button
   * - Keydown event on the document
   *
   * @return {void}
   */
  private bindEvents(): void {
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleControlSchemeButtonClick =
      this.handleControlSchemeButtonClick.bind(this);

    const root = this.shadowRoot;

    this.eventTracker.addById(root, 'prev-scheme-button', 'click', () =>
      this.handleControlSchemeButtonClick('prev'),
    );

    this.eventTracker.addById(root, 'next-scheme-button', 'click', () =>
      this.handleControlSchemeButtonClick('next'),
    );

    this.eventTracker.add(
      document,
      'keydown',
      this.handleKeyPress as EventListener,
    );
  }

  /**
   * Handles the click event of the control scheme buttons.
   *
   * The function takes care of switching the current control scheme to the
   * previous or next one in the list of available control schemes.
   *
   * @param {'prev' | 'next'} buttonDirection - The direction of the control
   * scheme button that was clicked.
   * @return {void}
   */
  private handleControlSchemeButtonClick(
    buttonDirection: 'prev' | 'next',
  ): void {
    const schemes = this.availableControlSchemes;
    const currentIndex = schemes.indexOf(this.controlSchemeName);
    const newIndex =
      buttonDirection === 'prev'
        ? (currentIndex - 1 + schemes.length) % schemes.length
        : (currentIndex + 1) % schemes.length;

    this.controlSchemeName = schemes[newIndex];
    this.updateControlSchemeName();
    this.populateControlsTable(this.controlSchemeName);
  }

  /**
   * Updates the displayed name of the control scheme in the UI.
   *
   * This function selects the HTML element with the ID 'controls-scheme-name'
   * and sets its text content to the uppercase version of the current
   * control scheme name, followed by '- controls'.
   */

  private updateControlSchemeName() {
    const schemeNameElement = this.shadowRoot?.querySelector(
      '#controls-scheme-name',
    ) as HTMLDivElement;
    schemeNameElement.textContent = `${this.controlSchemeName.toUpperCase()} - controls`;
  }

  /**
   * Populates the controls table with the controls data for the given control
   * scheme.
   *
   * The function takes the given control scheme name and looks up the
   * associated control scheme in the controlSchemes object. It then uses the
   * controls data to populate the controls table in the UI.
   *
   * @param {ControlSchemeName} controlSchemeName - The name of the control scheme
   * to populate the table with.
   * @return {void}
   */
  private populateControlsTable(controlSchemeName: ControlSchemeName): void {
    const controlsListElement = this.shadowRoot?.querySelector(
      '#controls-list',
    ) as HTMLTableSectionElement;

    if (!controlsListElement) return;

    controlsListElement.innerHTML = '';

    const selectedScheme = controlSchemes[controlSchemeName];
    if (!selectedScheme) return;

    controlsData.controls.forEach(({ action, description }) => {
      const row = document.createElement('tr');
      const keyCell = document.createElement('td');
      const actionCell = document.createElement('td');

      const keys = (selectedScheme as ControlSchemeType)[action] || [];
      keyCell.textContent =
        action === 'scroll_list'
          ? this.formatScrollListKeys(keys)
          : keys.length
            ? keys.join(' / ')
            : 'N/A';

      keyCell.classList.add('key-cell');
      actionCell.textContent = description;
      actionCell.classList.add('action-cell');

      row.append(keyCell, actionCell);
      controlsListElement.appendChild(row);
    });
  }

  /**
   * Formats the keys for the scroll list control action into a human-readable string.
   *
   * If the control action contains modifiers (Alt or Meta), it will be formatted as
   * "modifiers + keyActions". If the control action does not contain modifiers, it
   * will be formatted as "key1 / key2 / ...". If the control action contains no keys
   * at all, it will be formatted as "N/A".
   *
   * @param {string[]} keys - The list of keys associated with the scroll list control
   * action.
   * @return {string} The formatted string representing the scroll list control action.
   */
  private formatScrollListKeys(keys: string[]): string {
    const modifiers = keys.filter(k => k === 'Alt' || k === 'Meta').join(' / ');
    const keyActions = keys
      .filter(k => k !== 'Alt' && k !== 'Meta')
      .join(' | ');

    return modifiers && keyActions
      ? `${modifiers} + ${keyActions}`
      : keys.join(' / ');
  }

  /**
   * Handles key presses for navigating between control schemes.
   *
   * This function listens for the '<' and '>' keys to switch to the previous
   * or next control scheme, respectively. If either key is pressed, it triggers
   * the corresponding control scheme button click handler.
   *
   * @param {KeyboardEvent} event - The keyboard event object containing
   * details about the key press.
   * @return {void}
   */

  private handleKeyPress(event: KeyboardEvent): void {
    switch (event.key) {
      case '<':
        this.handleControlSchemeButtonClick('prev');
        break;
      case '>':
        this.handleControlSchemeButtonClick('next');
        break;
      default:
        break;
    }
  }

  /**
   * Removes event listeners for keydown and click events.
   *
   * This function is called when the custom element is removed from the DOM.
   * It removes event listeners for keydown and click events that were added in the
   * connectedCallback function.
   *
   * @return {void}
   */
  disconnectedCallback(): void {
    this.eventTracker.removeAll();
  }
}
