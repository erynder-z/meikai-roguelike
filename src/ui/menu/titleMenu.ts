import { ask } from '@tauri-apps/plugin-dialog';
import { BaseDirectory, readFile } from '@tauri-apps/plugin-fs';
import { exit } from '@tauri-apps/plugin-process';
import { invoke } from '@tauri-apps/api/core';

export class TitleMenu extends HTMLElement {
  private shouldEnableLoadGameKeyboardShortcuts: boolean = true;
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
      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        height: 100%;
        width: 100%;
        background: var(--backgroundDefaultTransparent);
      }

      .container h1 {
        margin: 8rem 0 0 0;
        text-align: center;
        z-index: 1;
      }

      .container button {
        font-family: 'UASQUARE';
        padding: 1rem;
        font-size: 2.5rem;
        font-weight: bold;
        background: none;
        color: var(--white);
        border: none;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
      }

      .container button:hover {
        transform: rotate(4deg);
      }

      .underline {
        text-decoration: underline;
      }

      .buttons-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.5rem;
        height: 100%;
      }

      .bottom-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        margin-top: auto;
      }

      .version-display {
        padding: 0 1rem;
        font-size: 1.5rem;
      }

       button[disabled] {
          opacity: 0.5;
          cursor: not-allowed;
      }
    </style>

    <div class="container">
      <h1>Meikai: Roguelike Journey to the Center of the Earth</h1>
      <div class="buttons-container">
        <button id="new-game-button">
          <span class="underline">N</span>ew game
        </button>
        <button id="load-game-button" disabled>
          <span class="underline">L</span>oad game
        </button>
        <button id="player-setup-button">
          <span class="underline">P</span>layer setup
        </button>
         <button id="title-options-button">
          <span class="underline">O</span>ptions
        </button>
        <button id="help-button">
          <span class="underline">H</span>elp
        </button>
        <button id="about-window-button">
          <span class="underline">A</span>bout
        </button>
        <button id="quit-window-button">
          <span class="underline">Q</span>uit
        </button>
      </div>
      <div class="bottom-container">
        <div class="version-display">version: alpha</div>
      </div>
    </div>
  `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));

    this.checkForSaveState();
    this.bindEvents();
  }

  /**
   * Binds events to the elements in the title menu.
   *
   * The function binds the following events:
   * - Click event on the new game button
   * - Click event on the load game button
   * - Click event on the player setup button
   * - Click event on the options button
   * - Click event on the help button
   * - Click event on the about button
   * - Click event on the quit button
   * - Keydown event on the document
   *
   * @return {void}
   */

  private bindEvents(): void {
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.startNewGame = this.startNewGame.bind(this);
    this.loadGame = this.loadGame.bind(this);
    this.playerSetup = this.playerSetup.bind(this);
    this.showHelp = this.showHelp.bind(this);
    this.showAbout = this.showAbout.bind(this);
    this.quitGame = this.quitGame.bind(this);

    this.manageEventListener(
      'new-game-button',
      'click',
      this.startNewGame,
      true,
    );
    this.manageEventListener('load-game-button', 'click', this.loadGame, true);
    this.manageEventListener(
      'player-setup-button',
      'click',
      this.playerSetup,
      true,
    );
    this.manageEventListener(
      'title-options-button',
      'click',
      this.showOptions,
      true,
    );
    this.manageEventListener('help-button', 'click', this.showHelp, true);
    this.manageEventListener(
      'about-window-button',
      'click',
      this.showAbout,
      true,
    );
    this.manageEventListener(
      'quit-window-button',
      'click',
      this.quitGame,
      true,
    );

    document.addEventListener('keydown', this.handleKeyPress);
  }

  /**
   * Manage event listeners for an element.
   *
   * If the add parameter is true, the callback is added to the element's event
   * listeners. If the add parameter is false, the callback is removed from the
   * element's event listeners.
   *
   * @param {string} elementId - The ID of the element on which to add or remove
   * the event listener.
   * @param {string} eventType - The type of event to listen for.
   * @param {EventListener} callback - The callback function to be called when the
   * event is fired.
   * @param {boolean} add - Whether to add or remove the event listener.
   * @return {void}
   */
  private manageEventListener(
    elementId: string,
    eventType: string,
    callback: EventListener,
    add: boolean,
  ): void {
    const element = this.shadowRoot?.getElementById(elementId);
    if (add) {
      element?.addEventListener(eventType, callback);
    } else {
      element?.removeEventListener(eventType, callback);
    }
  }

  /**
   * Handles key presses on the title menu.
   *
   * Listens for the following keys and calls the corresponding method to navigate the title menu:
   * - N: startNewGame
   * - L: loadGame
   * - P: playerSetup
   * - O: showOptions
   * - H: showHelp
   * - A: showAbout
   * - Q: quitGame
   *
   * @param {KeyboardEvent} event - The keyboard event to be handled.
   * @return {void}
   */
  private handleKeyPress(event: KeyboardEvent): void {
    switch (event.key) {
      case 'N':
        this.startNewGame();
        break;
      case 'L':
        if (this.shouldEnableLoadGameKeyboardShortcuts) this.loadGame();
        break;
      case 'P':
        this.playerSetup();
        break;
      case 'O':
        this.showOptions();
        break;
      case 'H':
        this.showHelp();
        break;
      case 'A':
        this.showAbout();
        break;
      case 'Q':
        this.quitGame();
        break;
      default:
        break;
    }
  }

  /**
   * Checks for the existence of a saved game state file.
   *
   * This function attempts to read the 'savestate.bin' file from the application's
   * data directory. If the file is found and contains data, it enables the load game button.
   * Logs an error message to the console if there is an issue accessing the file.
   *
   * @return {Promise<void>} A promise that resolves when the check is completed.
   */

  private async checkForSaveState(): Promise<void> {
    try {
      const binaryData = await readFile('savestate.bin', {
        baseDir: BaseDirectory.AppData,
      });
      if (binaryData) {
        this.enableLoadGameButton();
        this.enableLoadGameKeyboardShortcut();
      }
    } catch (error) {
      console.error('Error checking for saved game:', error);
    }
  }

  /**
   * Enables the load game button.
   *
   * This function removes the 'disabled' attribute from the load game button,
   * allowing the user to load a saved game. It is typically called after
   * confirming the presence of a saved game state.
   */

  private enableLoadGameButton(): void {
    const loadGameButton = this.shadowRoot?.getElementById('load-game-button');
    if (loadGameButton) loadGameButton.removeAttribute('disabled');
  }

  /**
   * Enables the load game keyboard shortcut.
   *
   * Sets the flag to allow keyboard shortcuts for loading a game. This function
   * is typically called after confirming the presence of a saved game state.
   */

  private enableLoadGameKeyboardShortcut(): void {
    this.shouldEnableLoadGameKeyboardShortcuts = true;
  }

  /**
   * Dispatches a 'start-new-game' event.
   *
   * This event can be listened for by other components to start a new game.
   *
   * @return {void}
   */
  public startNewGame(): void {
    this.dispatchEvent(
      new CustomEvent('start-new-game', { bubbles: true, composed: true }),
    );
  }

  /**
   * Dispatches a 'load-game' event.
   *
   * This event can be listened to by other components to load a saved game.
   *
   * @return {void}
   */
  public loadGame(): void {
    this.dispatchEvent(
      new CustomEvent('load-game', { bubbles: true, composed: true }),
    );
  }

  /**
   * Shows the player setup screen.
   *
   * This function will query the first 'title-screen' element in the document
   * and replace its content with a 'player-setup' element. This element will
   * allow the user to modify their player's name and appearance.
   *
   * @return {void}
   */
  public playerSetup(): void {
    const titleScreenContent = document
      .querySelector('title-screen')
      ?.shadowRoot?.getElementById('title-screen-content');

    if (titleScreenContent) {
      titleScreenContent.innerHTML = '';
      titleScreenContent.appendChild(document.createElement('player-setup'));
    }
  }

  /**
   * Replaces the title screen content with the main options menu.
   *
   * This function queries the first 'title-screen' element in the document,
   * clears its content, and appends a 'title-menu-options' element.
   *
   * @return {void}
   */

  public showOptions(): void {
    const titleScreenContent = document
      .querySelector('title-screen')
      ?.shadowRoot?.getElementById('title-screen-content');

    if (titleScreenContent) {
      titleScreenContent.innerHTML = '';
      titleScreenContent.appendChild(
        document.createElement('title-menu-options'),
      );
    }
  }

  /**
   * Opens a new window with the game's help documentation.
   * @return {void}
   */
  private showHelp(): void {
    invoke('create_hidden_help_window');
  }

  private showAbout() {
    alert('About');
  }

  /**
   * Calls the Tauri backend to quit the game. Asks for confirmation before quitting.
   *
   * @return {Promise<void>} A promise that resolves when the game is exited.
   */
  private async quitGame(): Promise<void> {
    try {
      const confirmation = await ask('Are you sure you want to quit?', {
        title: 'Confirm Quit',
        kind: 'warning',
      });

      if (confirmation) await exit();
    } catch (error) {
      console.error('Failed to quit the game:', error);
    }
  }

  /**
   * Removes event listeners for keydown and click events.
   *
   * This function is called when the custom element is removed from the DOM.
   * It removes event listeners for keydown and click events that were added in the
   * connectedCallback function.
   * @return {void}
   */
  disconnectedCallback(): void {
    document.removeEventListener('keydown', this.handleKeyPress);

    const shadowRoot = this.shadowRoot;
    if (shadowRoot) {
      shadowRoot
        .getElementById('new-game-button')
        ?.removeEventListener('click', this.startNewGame);
      shadowRoot
        .getElementById('help-button')
        ?.removeEventListener('click', this.showHelp);
      shadowRoot
        .getElementById('about-window-button')
        ?.removeEventListener('click', this.showAbout);
      shadowRoot
        .getElementById('quit-window-button')
        ?.removeEventListener('click', this.quitGame);
    }
  }
}
