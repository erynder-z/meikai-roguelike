import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { GameConfigType } from '../../types/gameConfig/gameConfigType';
import { getRandomColor } from '../../randomGenerator/getRandomColor';
import { EventListenerTracker } from '../../utilities/eventListenerTracker';
import { getRandomUnicodeCharacter } from '../../randomGenerator/getRandomAvatar';
import { getRandomName } from '../../randomGenerator/getRandomName';
import {
  girlishPortrait,
  boyishPortrait,
} from '../../media/imageHandler/imageImports/portraitImages';
import { UnBlurElement } from '../other/unBlurElement';

export class PlayerSetup extends UnBlurElement {
  private eventTracker = new EventListenerTracker();
  private gameConfig = gameConfigManager.getConfig();
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
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          width: 100%;
          line-height: 1.75;
          background: var(--backgroundDefaultTransparent);
        }

        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 45ch;
        }

        .container h1 {
          margin: 8rem 0 0 0;
          text-align: center;
          z-index: 1;
        }

        .player-about {
          width: 45ch;
        }

        .player-about > div:nth-child(1) {
          transform: rotate(-1deg);
        }

        .player-about > div:nth-child(2) {
          margin-left: 0.5rem;
          transform: rotate(1.2deg);
        }

        .player-about > div:nth-child(3) {
          margin-left: 0.1rem;
          transform: rotate(0.3deg);
        }
        .player-about > div:nth-child(4) {
          margin-left: 0.8rem;
          transform: rotate(0.8deg);
        }

        .container button {
          font-family: 'UA Squared';
          padding: 1rem;
          font-size: 2.5rem;
          font-weight: bold;
          background: none;
          color: var(--white);
          border: none;
          transition: all 0.2s ease-in-out;
        }

        button.randomize-name-button,
        button.randomize-avatar-button,
        button.randomize-color-button {
          font-size: 1.5rem;
          padding: 0 0 0 1rem;
        }

        .container button:hover {
          cursor: pointer;
          transform: scale(1.1);
        }

        .underline {
          text-decoration: underline;
        }

        .buttons-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
          gap: 0.5rem;
        }

        .buttons-container button {
          transform: rotate(-1.2deg);
        }

        .appearance {
          display: flex;
          justify-content: space-evenly;
          margin: 4rem 0;
        }

        .portrait {
          transition: filter 0.2s ease;
          cursor: pointer;
        }

        img {
          width: auto;
          height: 20rem;
        }

        .highlight {
          filter: none;
        }

        .inactive {
          filter: grayscale(100%) brightness(50%);
        }

        .name-container,
        .color-container,
        .avatar-container {
          display: flex;
          justify-content: left;
          align-items: center;
          font-weight: bold;
          cursor: default;
        }

        .name {
          cursor: pointer;
          font-family: 'UA Squared';
          font-size: 2.5rem;
          font-weight: bold;
          color: var(--white);
          padding: 0;
          outline: none;
          background: none;
          transition: font-size 0.2s ease-in-out;
        }

        .name-input {
          display: none;
          width: 100%;
          font-family: 'UA Squared';
          font-size: 2.5rem;
          font-weight: bold;
          background: none;
          border: none;
          outline: none;
          color: var(--white);
          padding: 0;
          transition: font-size 0.2s ease-in-out;
        }

        .color-input {
          display: flex;
          height: 2.5rem;
          border-radius: 5%;
          padding: 0;
          margin: 0;
          background: none;
          outline: none;
          border: none;
          cursor: pointer;
        }

        .avatar {
          cursor: pointer;
          font-family: 'DejaVu Sans Mono';
          font-size: 2.5rem;
          font-weight: bold;
          color: var(--white);
          padding: 0;
          outline: none;
          background: none;
          transition: font-size 0.2s ease-in-out;
        }

        .avatar-input {
          display: none;
          width: 100%;
          font-family: 'DejaVu Sans Mono';
          font-size: 2.5rem;
          font-weight: bold;
          background: none;
          border: none;
          outline: none;
          color: var(--white);
          padding: 0;
          transition: font-size 0.2s ease-in-out;
        }

        .info-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          font-size: 1.25rem;
          text-align: left;
          margin-top: 1rem;
        }
      </style>

      <div class="container">
        <h1>Player setup</h1>
        <div class="player-about">
          <div class="appearance">
            <div id="player-portrait-girlish" class="portrait"></div>
            <div id="player-portrait-boyish" class="portrait"></div>
          </div>
          <div class="name-container">
            <span class="underline">N</span>ame:&nbsp;
            <input
              id="player-name-input"
              class="name-input"
              type="text"
              autocomplete="off"
              maxlength="30"
            />
            <div id="player-name" class="name"></div>
            <button id="randomize-name-button" class="randomize-name-button">
              (r<span class="underline">a</span>ndomize)
            </button>
          </div>
          <div class="color-container">
            <span class="underline">C</span>olor:&nbsp;
            <div class="color-input-container">
              <input
                id="player-color-input"
                class="color-input"
                type="color"
              />
            </div>
            <button id="randomize-color-button" class="randomize-color-button">
              (rand<span class="underline">o</span>mize)
            </button>
          </div>
          <div class="avatar-container">
            <span class="underline">A</span>vatar:&nbsp;
            <input
              id="player-avatar-input"
              class="avatar-input"
              type="text"
              autocomplete="off"
              maxlength="1"
            />
            <div id="player-avatar" class="avatar"></div>
            <button id="randomize-avatar-button" class="randomize-avatar-button">
              (randomi<span class="underline">z</span>e)
            </button>
          </div>
        </div>
        <div class="info-container">
         <span>Meta + Arrow keys to toggle appearance</span>
         <span>Meta + r to randomize all</span>
        </div>
        <div class="buttons-container">
          <button id="return-button">
            <span class="underline">R</span>eturn
          </button>
        </div>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));

    super.connectedCallback();
    this.bindEvents();
    this.displayPlayer(this.gameConfig.player);
    this.unBlur();
  }

  /**
   * Bind events to the elements inside the player setup menu.
   *
   * The function binds the following events:
   * - Click event on the girlish portrait button.
   * - Click event on the boyish portrait button.
   * - Click event on the player name span.
   * - Change event on the player name input.
   * - Click event on the randomize name button.
   * - Change event on the player color input.
   * - Click event on the randomize color button.
   * - Click event on the player avatar span.
   * - Change event on the player avatar input.
   * - Click event on the randomize avatar button.
   * - Click event on the return button.
   * - Keydown event on the document.
   */
  private bindEvents(): void {
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.toggleAppearance = this.toggleAppearance.bind(this);
    this.enableNameEditing = this.enableNameEditing.bind(this);
    this.handleNameInputChange = this.handleNameInputChange.bind(this);
    this.randomizeName = this.randomizeName.bind(this);
    this.handleColorInputChange = this.handleColorInputChange.bind(this);
    this.changeColor = this.changeColor.bind(this);
    this.randomizeColor = this.randomizeColor.bind(this);
    this.enableAvatarEditing = this.enableAvatarEditing.bind(this);
    this.handleAvatarInputChange = this.handleAvatarInputChange.bind(this);
    this.randomizeAvatar = this.randomizeAvatar.bind(this);
    this.randomize = this.randomize.bind(this);
    this.returnToPreviousScreen = this.returnToPreviousScreen.bind(this);

    const root = this.shadowRoot;

    this.eventTracker.addById(root, 'player-portrait-girlish', 'click', () => {
      this.changeAppearanceTo('girlish');
    });

    this.eventTracker.addById(root, 'player-portrait-boyish', 'click', () => {
      this.changeAppearanceTo('boyish');
    });

    this.eventTracker.addById(
      root,
      'player-name',
      'click',
      this.enableNameEditing,
    );

    this.eventTracker.addById(root, 'randomize-name-button', 'click', () =>
      this.randomize('name'),
    );

    this.eventTracker.addById(
      root,
      'player-color-input',
      'change',
      this.handleColorInputChange,
    );

    this.eventTracker.addById(root, 'randomize-color-button', 'click', () =>
      this.randomize('color'),
    );

    this.eventTracker.addById(
      root,
      'player-avatar',
      'click',
      this.enableAvatarEditing,
    );

    this.eventTracker.addById(root, 'randomize-avatar-button', 'click', () =>
      this.randomize('avatar'),
    );

    this.eventTracker.addById(root, 'return-button', 'click', async () => {
      this.returnToPreviousScreen();
    });

    this.eventTracker.add(
      document,
      'keydown',
      this.handleKeyPress as EventListener,
    );
  }

  /**
   * Handle key presses that occur while the player setup screen is active.
   *
   * This function is called whenever a key is pressed while the player setup
   * screen is displayed. It checks if the name input is focused and if so,
   * returns early. Otherwise, it checks if the pressed key corresponds to one
   * of the keys that can be used to control the player setup screen, and if so,
   * calls the appropriate function to handle the key press. If the pressed key
   * does not match any of the handled keys, the function does nothing.
   *
   * @param event - The event object that contains information about the key press.
   */
  private handleKeyPress(event: KeyboardEvent): void {
    const nameInputElement = this.shadowRoot?.getElementById(
      'player-name-input',
    ) as HTMLInputElement;
    const avatarInputElement = this.shadowRoot?.getElementById(
      'player-avatar-input',
    ) as HTMLInputElement;

    const isFocused =
      this.shadowRoot?.activeElement === nameInputElement ||
      this.shadowRoot?.activeElement === avatarInputElement;

    if (isFocused) {
      return; // Return early if the name input is focused.
    } else {
      event.preventDefault();
    }

    switch (event.key) {
      case 'N':
        this.enableNameEditing();
        break;
      case 'a':
        this.randomize('name');
        break;
      case 'C':
        this.changeColor();
        break;
      case 'o':
        this.randomize('color');
        break;
      case 'A':
        this.enableAvatarEditing();
        break;
      case 'z':
        this.randomize('avatar');
        break;
      case 'R':
        this.returnToPreviousScreen();
        break;
      case 'ArrowLeft':
        if (event.metaKey) this.toggleAppearance();
        break;
      case 'ArrowRight':
        if (event.metaKey) this.toggleAppearance();
        break;
      case 'r':
        if (event.metaKey) this.randomize('all');
        break;
      default:
        break;
    }
  }

  /**
   * Renders the player's current portrait, name, and avatar in the UI.
   *
   * @param player - The player object containing the appearance, name, and avatar information.
   */
  private displayPlayer(player: GameConfigType['player']): void {
    const isGirlish = player.appearance === 'girlish';
    this.renderPortraitElement(
      'player-portrait-girlish',
      girlishPortrait,
      isGirlish,
    );
    this.renderPortraitElement(
      'player-portrait-boyish',
      boyishPortrait,
      !isGirlish,
    );

    this.renderNameElement('player-name', player.name);
    this.setColorInputValue(player.color);
    this.renderNameElement('player-avatar', player.avatar);
  }

  /**
   * Renders a portrait element with the specified image HTML and highlight status.
   *
   * @param elementId - The ID of the element to render.
   * @param imageHTML - The HTML string of the portrait image.
   * @param isHighlighted - Whether the portrait should be highlighted.
   */
  private renderPortraitElement(
    elementId: string,
    imageHTML: string,
    isHighlighted: boolean,
  ): void {
    const element = this.shadowRoot?.getElementById(
      elementId,
    ) as HTMLDivElement;
    if (element) {
      element.innerHTML = imageHTML;
      element.classList.toggle('highlight', isHighlighted);
      element.classList.toggle('inactive', !isHighlighted);
    }
  }

  /**
   * Renders a name element with the specified content.
   *
   * @param elementId - The ID of the element to render.
   * @param content - The text content of the element.
   */
  private renderNameElement(elementId: string, content: string): void {
    const element = this.shadowRoot?.getElementById(
      elementId,
    ) as HTMLDivElement;
    if (element) element.textContent = content;
  }

  /**
   * Toggles the player's appearance between 'girlish' and 'boyish'. Updates the
   * UI to reflect the new appearance.
   */
  private toggleAppearance(): void {
    const player = this.gameConfig.player;
    player.appearance = player.appearance === 'girlish' ? 'boyish' : 'girlish';
    this.displayPlayer(player);
  }

  /**
   * Updates the player's appearance to the specified value, and updates the UI
   * to reflect the new appearance.
   *
   * @param appearance - The new appearance of the player, either 'boyish' or 'girlish'.
   */
  private changeAppearanceTo(appearance: 'boyish' | 'girlish'): void {
    const player = this.gameConfig.player;
    player.appearance = appearance;
    this.displayPlayer(player);
  }

  /**
   * Enables the player name input element for editing, hiding the player name element and the randomize name button.
   */
  private enableNameEditing(): void {
    const inputElement = this.shadowRoot?.getElementById(
      'player-name-input',
    ) as HTMLInputElement;
    const nameElement = this.shadowRoot?.getElementById(
      'player-name',
    ) as HTMLDivElement;
    const randomizeButton = this.shadowRoot?.getElementById(
      'randomize-name-button',
    ) as HTMLButtonElement;

    randomizeButton.style.display = 'none';
    inputElement.style.display = 'flex';
    inputElement.value = this.gameConfig.player.name;
    nameElement.style.display = 'none';
    inputElement.focus();

    inputElement.addEventListener('blur', this.handleNameInputChange);
    inputElement.addEventListener('keydown', event => {
      if (event.key === 'Enter') this.handleNameInputChange();
    });
  }

  /**
   * Handles the blur event on the player name input element by saving the new name to gameConfig and hiding the input element.
   */
  private handleNameInputChange(): void {
    const inputElement = this.shadowRoot?.getElementById(
      'player-name-input',
    ) as HTMLInputElement;
    const nameElement = this.shadowRoot?.getElementById(
      'player-name',
    ) as HTMLDivElement;
    const randomizeButton = this.shadowRoot?.getElementById(
      'randomize-name-button',
    ) as HTMLButtonElement;

    if (inputElement) {
      const newName = inputElement.value.trim();
      this.gameConfig.player.name = newName || 'Unnamed';
      this.renderNameElement('player-name', this.gameConfig.player.name);
      nameElement.style.display = 'inline';
      inputElement.style.display = 'none';
      randomizeButton.style.display = 'inline';
    }
  }

  /**
   * Sets the player's name to a random name based on their appearance.
   */
  private randomizeName(): void {
    this.gameConfig.player.name = getRandomName(
      this.gameConfig.player.appearance,
    );
  }

  /**
   * Sets the player's avatar to a random unicode character.
   */
  private randomizeAvatar(): void {
    this.gameConfig.player.avatar = getRandomUnicodeCharacter();
  }

  /**
   * Sets the value of the player color input element to the given color.
   *
   * This function is called when the player's color is changed from the player setup screen.
   *
   * @param color - The new color for the player.
   */
  private setColorInputValue(color: string): void {
    const colorInput = this.shadowRoot?.getElementById(
      'player-color-input',
    ) as HTMLInputElement;
    if (colorInput) colorInput.value = color;
  }

  /**
   * Handles the change event on the player color input element by saving the new color to gameConfig.
   */
  private handleColorInputChange(): void {
    const colorInput = this.shadowRoot?.getElementById(
      'player-color-input',
    ) as HTMLInputElement;
    this.gameConfig.player.color = colorInput?.value;
  }

  /**
   * Simulates a click event on the player color input element, allowing the user to select a color from the color picker.
   */
  private changeColor(): void {
    const colorInput = this.shadowRoot?.getElementById(
      'player-color-input',
    ) as HTMLInputElement;
    if (colorInput) colorInput.click();
  }

  /**
   * Sets the player's color to a random color.
   */
  private randomizeColor(): void {
    const randomColor = getRandomColor();
    const colorInput = this.shadowRoot?.getElementById(
      'player-color-input',
    ) as HTMLInputElement;

    if (colorInput) {
      colorInput.value = randomColor;
      this.gameConfig.player.color = randomColor;
    }
  }

  /**
   * Enables the avatar input element for editing, hiding the avatar element and randomize button.
   */
  private enableAvatarEditing(): void {
    const inputElement = this.shadowRoot?.getElementById(
      'player-avatar-input',
    ) as HTMLInputElement;
    const avatarElement = this.shadowRoot?.getElementById(
      'player-avatar',
    ) as HTMLDivElement;
    const randomizeButton = this.shadowRoot?.getElementById(
      'randomize-avatar-button',
    ) as HTMLButtonElement;

    randomizeButton.style.display = 'none';
    inputElement.style.display = 'flex';
    inputElement.value = this.gameConfig.player.avatar;
    avatarElement.style.display = 'none';
    inputElement.focus();

    inputElement.addEventListener('blur', this.handleAvatarInputChange);
    inputElement.addEventListener('keydown', event => {
      if (event.key === 'Enter') this.handleAvatarInputChange();
    });
  }

  /**
   * Handles the blur event on the player avatar input element by saving the new avatar to gameConfig and hiding the input element.
   */
  private handleAvatarInputChange(): void {
    const inputElement = this.shadowRoot?.getElementById(
      'player-avatar-input',
    ) as HTMLInputElement;
    const avatarElement = this.shadowRoot?.getElementById(
      'player-avatar',
    ) as HTMLDivElement;
    const randomizeButton = this.shadowRoot?.getElementById(
      'randomize-avatar-button',
    ) as HTMLButtonElement;

    if (inputElement) {
      const newAvatar = inputElement.value.trim();
      this.gameConfig.player.avatar = newAvatar || '@';
      this.renderNameElement('player-avatar', this.gameConfig.player.avatar);
      avatarElement.style.display = 'inline';
      inputElement.style.display = 'none';
      randomizeButton.style.display = 'inline';
    }
  }

  /**
   * Randomizes the player's appearance.
   */
  private randomizeAppearance(): void {
    this.gameConfig.player.appearance =
      Math.random() > 0.5 ? 'boyish' : 'girlish';
  }

  /**
   * Randomizes a specified part of the player's settings.
   *
   * Randomizes either the player's appearance, name, color, avatar, or all of
   * the above.
   *
   * @param element The element to randomize. Can be 'appearance', 'name', 'color', 'avatar', or 'all'.
   */
  private randomize(
    element: 'appearance' | 'name' | 'color' | 'avatar' | 'all',
  ): void {
    switch (element) {
      case 'appearance':
        this.randomizeAppearance();
        break;
      case 'name':
        this.randomizeName();
        break;
      case 'color':
        this.randomizeColor();
        break;
      case 'avatar':
        this.randomizeAvatar();
        break;
      case 'all':
        this.randomizeAppearance();
        this.randomizeName();
        this.randomizeColor();
        this.randomizeAvatar();
        break;
    }
    this.displayPlayer(this.gameConfig.player);
  }

  /**
   * Saves the current build parameters to a file and returns to the previous screen.
   *
   * This function is called when the user clicks the "start game" button on the player setup
   * screen. It saves the current build parameters to a file and then returns to the previous
   * screen by replacing the content of the title screen with the title menu element.
   *
   * @return A promise for when the file is saved and the screen is updated.
   */
  private async returnToPreviousScreen(): Promise<void> {
    try {
      await gameConfigManager.saveConfig();
    } catch (error) {
      console.error(error);
    }

    const titleScreenContent = document
      .querySelector('title-screen')
      ?.shadowRoot?.getElementById('title-screen-content');

    if (titleScreenContent) {
      titleScreenContent.innerHTML = '';
      titleScreenContent.appendChild(document.createElement('title-menu'));
    }
  }

  /**
   * Removes all event listeners from the element.
   *
   * This method is called when the element is removed from the DOM.
   * It removes all event listeners that were added in the connectedCallback method.
   */
  disconnectedCallback(): void {
    this.eventTracker.removeAll();
  }
}
