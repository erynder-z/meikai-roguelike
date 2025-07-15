import { ask } from '@tauri-apps/plugin-dialog';
import { BaseDirectory, writeFile } from '@tauri-apps/plugin-fs';
import { ControlSchemeManager } from '../../controls/controlSchemeManager';
import { EventListenerTracker } from '../../utilities/eventListenerTracker';
import { exit } from '@tauri-apps/plugin-process';
import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { GameState } from '../../types/gameBuilder/gameState';
import { invoke } from '@tauri-apps/api/core';
import { PopupHandler } from '../popup/popupHandler';
import { SaveStateHandler } from '../../savestates/saveStateHandler';
import { UnBlurElement } from '../other/unBlurElement';

export class IngameMenu extends UnBlurElement {
  private eventTracker = new EventListenerTracker();
  private game: GameState | null = null;
  private isRendered = false;
  private shouldDisableSaveKeyboardShortcut = false;

  private gameConfig = gameConfigManager.getConfig();
  private currentScheme = this.gameConfig.control_scheme || 'default';
  public controlSchemeManager: ControlSchemeManager;
  public activeControlScheme: Record<string, string[]>;

  set currentGame(value: GameState | null) {
    this.game = value;
  }

  get currentGame(): GameState | null {
    return this.game;
  }

  set rendered(value: boolean) {
    this.isRendered = value;
  }

  get rendered(): boolean {
    return this.isRendered;
  }

  constructor() {
    super();

    this.controlSchemeManager = new ControlSchemeManager(this.currentScheme);
    this.activeControlScheme = this.controlSchemeManager.getActiveScheme();
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
        .ingame-menu {
          font-family: 'UA Squared';
          font-size: 2.5rem;
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: start;
          height: 100%;
          width: 100%;
          backdrop-filter: brightness(60%) blur(10px);
          color: var(--white);
          z-index: 1;
          overflow: hidden;
        }

        .ingame-menu h1 {
          position: absolute;
          bottom: 0;
          left: 0;
          margin: 0 1rem;
          z-index: 1;
        }

        .ingame-menu button {
          font-family: 'UA Squared';
          padding: 1rem;
          font-size: 2.5rem;
          font-weight: bold;
          background: none;
          color: var(--white);
          border: none;
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }

        .ingame-menu button:hover {
          transform: translateX(8px) scale(1.05);
        }

        .underline {
          text-decoration: underline;
        }

        button[disabled] {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .buttons-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
          gap: 0.5rem;
        }
      </style>

      <div class="ingame-menu">
        <h1>Menu</h1>
        <div class="buttons-container">
          <button id="return-to-game-button">
            <span class="underline">R</span>eturn to game
          </button>
          <button id="show-options-button">
            <span class="underline">O</span>ptions
          </button>
          <button id="help-button">
            <span class="underline">H</span>elp
          </button>
          <button id="save-game-button">
            <span class="underline">S</span>ave game
          </button>
          <button id="return-to-title-button">
            Return to <span class="underline">t</span>itle
          </button>
          <button id="quit-app-button">
            <span class="underline">Q</span>uit game and exit
          </button>
        </div>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));

    super.connectedCallback();
    this.bindEvents();
    this.unBlur();

    // use animation frame to ensure rendered is set to true only after the element is fully rendered
    requestAnimationFrame(() => {
      this.rendered = true;
    });
  }

  /**
   * Bind events to the elements inside the options menu.
   *
   * The function binds the following events:
   * - Return to game button click event.
   * - Toggle scanlines button click event.
   * - Help button click event.
   * - Quit button click event.
   * - Keydown event on the document.
   */
  private bindEvents(): void {
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.returnToGame = this.returnToGame.bind(this);
    this.showOptions = this.showOptions.bind(this);
    this.showHelp = this.showHelp.bind(this);
    this.saveGame = this.saveGame.bind(this);
    this.returnToTitle = this.returnToTitle.bind(this);
    this.quitApp = this.quitApp.bind(this);

    const root = this.shadowRoot;

    this.eventTracker.addById(
      root,
      'return-to-game-button',
      'click',
      this.returnToGame,
    );

    this.eventTracker.addById(
      root,
      'show-options-button',
      'click',
      this.showOptions,
    );

    this.eventTracker.addById(root, 'help-button', 'click', this.showHelp);

    this.eventTracker.addById(root, 'save-game-button', 'click', this.saveGame);

    this.eventTracker.addById(
      root,
      'return-to-title-button',
      'click',
      this.returnToTitle,
    );

    this.eventTracker.addById(root, 'quit-app-button', 'click', this.quitApp);

    this.eventTracker.add(
      document,
      'keydown',
      this.handleKeyPress as EventListener,
    );
  }

  /**
   * Handles key presses on the options menu.
   *
   * @param event - The keyboard event to be handled.
   */
  private handleKeyPress(event: KeyboardEvent): void {
    // Prevent keyboard events before the element is fully rendered. In particular, this prevents the initial {menu} keypress to close the menu the moment it's being rendered.
    if (!this.rendered) return;

    switch (event.key) {
      case this.activeControlScheme.menu.toString():
      case 'R':
        this.returnToGame();
        break;
      case 'O':
        this.showOptions();
        break;
      case 'H':
        this.showHelp();
        break;
      case 'S':
        if (!this.shouldDisableSaveKeyboardShortcut) this.saveGame();
        break;
      case 't':
        this.returnToTitle();
        break;
      case 'Q':
        this.quitApp();
        break;
      default:
        break;
    }
  }

  /**
   * Removes the menu screen from the DOM.
   */
  private returnToGame(): void {
    const event = new CustomEvent('return-to-game', { bubbles: true });
    this.dispatchEvent(event);
    this.remove();
  }

  /**
   * Opens the options menu.
   *
   * Dispatches a custom event to open the options menu, and then removes the current element from the DOM.
   */
  private showOptions(): void {
    const event = new CustomEvent('open-options-menu', { bubbles: true });
    this.dispatchEvent(event);
    this.remove();
  }

  /**
   * Opens a new window with the game's help documentation.
   */
  private showHelp(): void {
    // Help window will start hidden and will be shown when the help-window DOM content is rendered.
    invoke('create_hidden_help_window');
  }

  /**
   * Saves the current game state to a file in the application's data directory.
   *
   * This function is called when the user clicks the "save" button on the ingame menu.
   * It serializes the current game state to a JSON string, encodes the string as binary data,
   * and then writes the data to a file named "savestate.bin" in the application's data directory.
   * If the file does not exist, it is created with write permissions.
   *
   * @return  A promise that resolves when the game is saved successfully, or rejects if there is an error saving the game.
   */
  private async saveGame(): Promise<void> {
    if (!this.game) return;

    try {
      const saveStateHandler = new SaveStateHandler();
      const gameState = this.game;
      const preparedGameState = saveStateHandler.prepareForSave(gameState);

      const jsonString = JSON.stringify(preparedGameState);
      const binaryData = new TextEncoder().encode(jsonString);

      await writeFile('savestate.bin', binaryData, {
        baseDir: BaseDirectory.AppData,
      });

      PopupHandler.showGoodPopup('Game saved successfully.');
      console.log('Game saved successfully.');

      this.disableSaveButton();
      this.disableSaveKeyboardShortcut();
    } catch (error) {
      PopupHandler.showBadPopup('Error saving game.');
      console.error('Error saving game:', error);
    }
  }

  /**
   * Disables the save game button.
   *
   * This function is called after a successful save to prevent the user from saving multiple times in a row.
   */
  private disableSaveButton(): void {
    const saveButton = this.shadowRoot?.getElementById('save-game-button');
    saveButton?.setAttribute('disabled', 'true');
  }

  /**
   * Disables the save game keyboard shortcut.
   *
   * This function is called after a successful save to prevent the user from saving multiple times in a row.
   */
  private disableSaveKeyboardShortcut(): void {
    this.shouldDisableSaveKeyboardShortcut = true;
  }

  /**
   * Returns to the title screen. Asks for confirmation before quitting.
   *
   * If the user confirms, the page is reloaded, which causes the game to restart.
   *
   * @return A promise that resolves when the screen is updated.
   */
  private async returnToTitle(): Promise<void> {
    try {
      const confirmation = await ask(
        'Game progress will be lost. Are you sure?',
        { title: 'Confirm Quit', kind: 'warning' },
      );

      if (confirmation) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to return to title:', error);
    }
  }

  /**
   * Calls the Tauri backend to quit the game. Asks for confirmation before quitting.
   *
   * @return A promise that resolves when the game is exited.
   */
  private async quitApp(): Promise<void> {
    try {
      const confirmation = await ask('Are you sure you want to quit?', {
        title: 'Confirm Quit',
        kind: 'warning',
      });

      if (confirmation) {
        await exit();
      }
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
   */
  disconnectedCallback(): void {
    this.eventTracker.removeAll();
  }
}
