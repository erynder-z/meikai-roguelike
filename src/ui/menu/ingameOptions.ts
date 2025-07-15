import controls from '../../controls/control_schemes.json';
import { ControlSchemeManager } from '../../controls/controlSchemeManager';
import { ControlSchemeName } from '../../types/controls/controlSchemeType';
import { EventListenerTracker } from '../../utilities/eventListenerTracker';
import { FlickerManager } from '../../renderer/flickerManager';
import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { KeypressScrollHandler } from '../../utilities/KeypressScrollHandler';
import { LayoutManager } from '../layoutManager/layoutManager';
import { OptionsMenuButtonManager } from './buttonManager/optionsMenuButtonManager';
import { ScanlinesHandler } from '../../renderer/scanlinesHandler';
import { UnBlurElement } from '../other/unBlurElement';

export class IngameOptions extends UnBlurElement {
  private gameConfig = gameConfigManager.getConfig();
  private eventTracker: EventListenerTracker;
  private layoutManager: LayoutManager;
  private buttonManager: OptionsMenuButtonManager;
  public controlSchemeManager: ControlSchemeManager;
  private currentScheme = this.gameConfig.control_scheme;
  private availableControlSchemes = Object.keys(
    controls,
  ) as ControlSchemeName[];

  public activeControlScheme: Record<string, string[]>;
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    this.eventTracker = new EventListenerTracker();
    this.layoutManager = new LayoutManager();
    this.buttonManager = new OptionsMenuButtonManager(shadowRoot);
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
    this.layoutManager.setMessageDisplayLayout(this.gameConfig.message_display);
    this.layoutManager.setImageDisplayLayout(this.gameConfig.image_display);

    const templateElement = document.createElement('template');
    templateElement.innerHTML = `
      <style>
        ::-webkit-scrollbar {
          width: 0.25rem;
        }

        ::-webkit-scrollbar-thumb {
          background-color: var(--scrollbar-foreground);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-track {
          background-color: var(--scrollbar-background);
        }
        
        .options-menu {
          font-family: 'UA Squared';
          font-size: 2rem;
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          width: 100%;
          backdrop-filter: brightness(60%) blur(10px);
          color: var(--white);
          z-index: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        button {
          font-family: 'UA Squared';
          padding: 1rem;
          font-size: 2rem;
          font-weight: bold;
          background: none;
          color: var(--white);
          border: none;
          transition: all 0.2s ease-in-out;
          cursor: pointer;
        }

        button:hover {
          transform: translateX(8px) scale(1.05);
        }

        .underline {
          text-decoration: underline;
        }

        .info-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
          gap: 0.5rem;
          min-width: 70ch;
        }

        .info-span {
          font-size: 2.5rem;
          width: 45%;
        }

        .info-span::after {
          content: "";
          display: block;
          width: 100%;
          height: 2px;
          background-color: var(--white);
        }

        .info-container div {
          width: max-content;
          margin: 0 auto;
        }

        .info-text {
          text-align: center;
          font-weight: bold;
          color: var(--grayedOut);
          cursor: not-allowed;
        }

        .explanation {
          font-size: 1rem;
        }

        .options-menu button.disabled {
          color: var(--grayedOut);
          pointer-events: none;
          cursor: not-allowed;
        }

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .message-count-input {
          -webkit-appearance: none;
          appearance: none;
          height: 1rem;
          background: var(--accent);
          outline: none;
          opacity: 0.7;
          display: flex;
          margin: 1rem auto;
          width: 33%;
        }

        .message-count-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 2rem;
          height: 2rem;
          background: var(--white);
        }

        .title {
          font-family: 'UA Squared';
          position: fixed;
          bottom: 0;
          left: 0;
          margin: 0 1rem;
          z-index: 1;
          font-size: 5rem;
          font-weight: bold;
        }

        .back-button {
          position: fixed;
          bottom: 0;
          right: 0;
          margin: 0 1rem;
          z-index: 1;
          font-size: 2.5rem;
        }
      </style>

      <div class="options-menu">
        <span class="info-span">Core</span>
        <div class="info-container">
          <div class="info-text">
            Current seed: ${this.gameConfig.seed} *
          </div>
          <div class="info-text">
            Current terminal font: ${this.gameConfig.terminal.font} *
          </div>
          <div class="info-text">
            Current terminal dimensions: ${this.gameConfig.terminal.dimensions.width} x ${this.gameConfig.terminal.dimensions.height} *
          </div>
          <div class="info-text">
            Current terminal scaling factor: ${this.gameConfig.terminal.scaling_factor} *
          </div>
          <div class="explanation">
            * Can only be changed from main menu.
          </div>
        </div>
        <span class="info-span">Gameplay</span>
        <div class="info-container">
          <button id="toggle-story-button">
           Show stor<span class="underline">y</span>
          </button>
        </div>
        <span class="info-span">Controls</span>
        <div class="info-container">
          <button id="switch-controls-button">
            <span class="underline">C</span>ontrol scheme
          </button>
          <div class="info-text">
            Current minimum keypress delay (in milliseconds): ${this.gameConfig.min_keypress_delay} *
          </div>
          <div class="explanation">
            * Can only be changed from main menu.
          </div>
        </div>
        <span class="info-span">Graphics</span>
        <div class="info-container">
          <button id="toggle-scanlines-button">
            <span class="underline">S</span>canlines
          </button>
          <button id="switch-scanline-style-button">
            Scanlines s<span class="underline">t</span>yle
          </button>
           <button id="toggle-flicker-button">
            <span class="underline">F</span>licker
          </button>
          <div class="info-text">
            Glyph shadow: ${this.gameConfig.show_glyph_shadow} *
          </div>
          <div class="explanation">
            * Can only be changed from main menu.
          </div>
        </div>
        <span class="info-span">UI</span>
        <div class="info-container">
          <button id="message-display-align-button">
            <span class="underline">M</span>essage display
          </button>
          <button id="show-images-button">
            Sh<span class="underline">o</span>w images
          </button>
          <button id="image-align-button">
            <span class="underline">I</span>mage alignment
          </button>
          <button id="message-count-input-button">
            <label for="message-count-input">
              M<span class="underline">e</span>ssages to Display (1-50):
            </label>
            <input
              type="range"
              id="message-count-input"
              class="message-count-input"
              min="1"
              max="50"
              value="${this.gameConfig.message_count}"
            >
            <div id="message-count-value" class="message-count-value">
              ${this.gameConfig.message_count}
            </div>
            </input>
            <div class="explanation">(Default: 35)</div>
          </button>
          <button id="temperature-units-button">
            Tem<span class="underline">p</span>erature units
          </button>
          <button id="depth-units-button">
            <span class="underline">D</span>epth units
          </button>
        </div>
        <span class="info-span">Misc</span>
        <div class="info-container">
          <button id="blood-intensity-button">
            <span class="underline">B</span>lood intensity
          </button>
        </div>
        
      </div>
      <div class="title">Options</div>
        <button id="back-button" class="back-button">
          <span class="underline">R</span>eturn to previous menu
        </button>
    `;

    this.shadowRoot?.appendChild(templateElement.content.cloneNode(true));

    super.connectedCallback();
    this.buttonManager.updateControlSchemeButton(this.currentScheme);
    this.buttonManager.updateScanlinesToggleButton(
      this.gameConfig.show_scanlines,
    );
    this.buttonManager.updateScanlineStyleButton(
      this.gameConfig.scanline_style,
    );
    this.buttonManager.updateFlickerToggleButton(this.gameConfig.show_flicker);
    this.buttonManager.updateMessageAlignButton(
      this.gameConfig.message_display,
    );
    this.buttonManager.updateTemperatureUnitsButton(
      this.gameConfig.temperature_unit,
    );
    this.buttonManager.updateDepthUnitsButton(this.gameConfig.depth_unit);
    this.buttonManager.updateShowImagesButton(this.gameConfig.show_images);
    this.buttonManager.updateImageAlignButton(this.gameConfig.image_display);
    this.setupMessageCountInput();
    this.buttonManager.updateStoryToggleButton(this.gameConfig.show_story);
    this.buttonManager.updateBloodIntensityButton(
      this.gameConfig.blood_intensity,
    );
    this.bindEvents();
    this.unBlur();
  }

  /**
   * Binds events to the elements inside the options menu.
   */
  private bindEvents(): void {
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.toggleShowStory = this.toggleShowStory.bind(this);
    this.toggleControlScheme = this.toggleControlScheme.bind(this);
    this.toggleScanlines = this.toggleScanlines.bind(this);
    this.switchScanlineStyle = this.switchScanlineStyle.bind(this);
    this.toggleFlicker = this.toggleFlicker.bind(this);
    this.toggleMessageAlignment = this.toggleMessageAlignment.bind(this);
    this.toggleTemperatureUnitChange =
      this.toggleTemperatureUnitChange.bind(this);
    this.toggleDepthUnitChange = this.toggleDepthUnitChange.bind(this);
    this.toggleShowImages = this.toggleShowImages.bind(this);
    this.toggleImageAlignment = this.toggleImageAlignment.bind(this);
    this.focusAndSelectMessageCountInput =
      this.focusAndSelectMessageCountInput.bind(this);
    this.toggleBloodIntensity = this.toggleBloodIntensity.bind(this);
    this.returnToIngameMenu = this.returnToIngameMenu.bind(this);

    const root = this.shadowRoot;

    this.eventTracker.addById(
      root,
      'toggle-story-button',
      'click',
      this.toggleShowStory,
    );

    this.eventTracker.addById(
      root,
      'switch-controls-button',
      'click',
      this.toggleControlScheme,
    );

    this.eventTracker.addById(
      root,
      'toggle-scanlines-button',
      'click',
      this.toggleScanlines,
    );

    this.eventTracker.addById(
      root,
      'switch-scanline-style-button',
      'click',
      this.switchScanlineStyle,
    );

    this.eventTracker.addById(
      root,
      'toggle-flicker-button',
      'click',
      this.toggleFlicker,
    );

    this.eventTracker.addById(
      root,
      'message-display-align-button',
      'click',
      this.toggleMessageAlignment,
    );

    this.eventTracker.addById(
      root,
      'temperature-units-button',
      'click',
      this.toggleTemperatureUnitChange,
    );

    this.eventTracker.addById(
      root,
      'depth-units-button',
      'click',
      this.toggleDepthUnitChange,
    );

    this.eventTracker.addById(
      root,
      'show-images-button',
      'click',
      this.toggleShowImages,
    );

    this.eventTracker.addById(
      root,
      'image-align-button',
      'click',
      this.toggleImageAlignment,
    );

    this.eventTracker.addById(
      root,
      'message-count-input-button',
      'click',
      event => this.handleMessageCountChange(event),
    );

    this.eventTracker.addById(
      root,
      'blood-intensity-button',
      'click',
      this.toggleBloodIntensity,
    );

    this.eventTracker.addById(
      root,
      'back-button',
      'click',
      this.returnToIngameMenu,
    );

    this.eventTracker.add(
      document,
      'keydown',
      this.handleKeyPress as EventListener,
    );
  }

  /**
   * Toggles the story display on or off.
   *
   * Updates the {@link gameConfig.show_story} property, and toggles the displayed text of the story toggle button.
   */
  private toggleShowStory(): void {
    this.gameConfig.show_story = !this.gameConfig.show_story;
    this.buttonManager.updateStoryToggleButton(this.gameConfig.show_story);
  }

  /**
   * Toggles the control scheme setting on or off.
   *
   * Updates the {@link gameConfig.control_scheme} property, and toggles the displayed text of the control scheme button.
   */
  private toggleControlScheme(): void {
    const currentSchemeIndex = this.availableControlSchemes.indexOf(
      this.gameConfig.control_scheme,
    );
    const nextSchemeIndex =
      (currentSchemeIndex + 1) % this.availableControlSchemes.length;
    const nextScheme = this.availableControlSchemes[nextSchemeIndex];

    this.gameConfig.control_scheme = nextScheme;
    this.currentScheme = nextScheme;

    this.buttonManager.updateControlSchemeButton(this.currentScheme);
  }

  /**
   * Toggles the scanlines setting on or off.
   *
   * Updates the {@link gameConfig.show_scanlines} property, and toggles the
   * 'scanlines' class on the main container element. The button text is also
   * updated based on the current state.
   */
  private toggleScanlines(): void {
    this.gameConfig.show_scanlines = !this.gameConfig.show_scanlines;

    const mainContainer = document.getElementById('main-container');

    if (mainContainer) ScanlinesHandler.handleScanlines(mainContainer);

    this.buttonManager.updateScanlinesToggleButton(
      this.gameConfig.show_scanlines,
    );
    this.buttonManager.updateScanlineStyleButton(
      this.gameConfig.scanline_style,
    );
  }

  /**
   * Switches the scanline style to the next available style.
   *
   * Updates the {@link gameConfig.scanline_style} property, and updates the
   * button text with the new style.
   *
   * Applies the new style to the main container element.
   *
   * Tries to save the updated config to local storage.
   */
  private switchScanlineStyle(): void {
    const availableStyles = ScanlinesHandler.SCANLINES_STYLES;
    const currentStyleIndex = availableStyles.indexOf(
      this.gameConfig.scanline_style,
    );

    const nextStyleIndex = (currentStyleIndex + 1) % availableStyles.length;
    const nextStyle = availableStyles[nextStyleIndex];

    this.gameConfig.scanline_style = nextStyle;

    this.buttonManager.updateScanlineStyleButton(
      this.gameConfig.scanline_style,
    );

    const mainContainer = document.getElementById('main-container');
    if (mainContainer)
      ScanlinesHandler.applyScanlineStyle(mainContainer, nextStyle);
  }

  /**
   * Toggles the flicker setting on or off.
   *
   * Updates the {@link gameConfig.show_flicker} property, and starts or stops the flicker effect.
   * The button text is also updated based on the current state.
   */
  private toggleFlicker(): void {
    this.gameConfig.show_flicker = !this.gameConfig.show_flicker;
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) FlickerManager.handleFlicker(canvasContainer);

    this.buttonManager.updateFlickerToggleButton(this.gameConfig.show_flicker);
  }

  /**
   * Toggles the message alignment between left and right.
   *
   * Updates the {@link gameConfig.message_display} property, updates the
   * message alignment button, and sets the layout of the main container based on
   * the current message alignment.
   */
  private toggleMessageAlignment(): void {
    this.gameConfig.message_display =
      this.gameConfig.message_display === 'left' ? 'right' : 'left';

    this.buttonManager.updateMessageAlignButton(
      this.gameConfig.message_display,
    );
    this.layoutManager.setMessageDisplayLayout(this.gameConfig.message_display);
  }

  /**
   * Toggles the show images setting on or off.
   *
   * Updates the {@link gameConfig.show_images} property, updates the show images
   * button, and sets the display of the image container based on the current
   * state. Also updates the disabled status of the image alignment button.
   */
  private toggleShowImages(): void {
    this.gameConfig.show_images = !this.gameConfig.show_images;

    this.buttonManager.updateShowImagesButton(this.gameConfig.show_images);
    this.layoutManager.setImageDisplay(this.gameConfig.show_images);
    this.layoutManager.forceSmileImageDisplay();

    this.buttonManager.shouldDisableImageAlignButton =
      !this.gameConfig.show_images;
    this.buttonManager.updateImageAlignButton(this.gameConfig.image_display);
  }

  /**
   * Toggles the image alignment between left and right.
   *
   * Updates the {@link gameConfig.image_display} property, updates the image
   * alignment button, and sets the layout of the image container based on the
   * current image alignment.
   */

  private toggleImageAlignment(): void {
    this.gameConfig.image_display =
      this.gameConfig.image_display === 'left' ? 'right' : 'left';

    this.buttonManager.updateImageAlignButton(this.gameConfig.image_display);
    this.layoutManager.setImageDisplayLayout(this.gameConfig.image_display);
  }

  /**
   * Toggles the temperature units between Celsius and Fahrenheit.
   *
   * Updates the {@link gameConfig.temperature_unit} property, and updates the
   * temperature units button.
   */
  private toggleTemperatureUnitChange(): void {
    this.gameConfig.temperature_unit =
      this.gameConfig.temperature_unit === 'celsius' ? 'fahrenheit' : 'celsius';

    this.buttonManager.updateTemperatureUnitsButton(
      this.gameConfig.temperature_unit,
    );

    const customEvent = new CustomEvent('redraw-temperature-info', {
      bubbles: true,
    });
    this.dispatchEvent(customEvent);
  }

  /**
   * Toggles the depth units between meters and feet.
   *
   * Updates the {@link gameConfig.depth_unit} property, and updates the
   * depth units button.
   *
   * Dispatches a custom 'redraw-temperature-info' event to request the redraw
   * of the level depth information element.
   */
  private toggleDepthUnitChange(): void {
    this.gameConfig.depth_unit =
      this.gameConfig.depth_unit === 'meters' ? 'feet' : 'meters';

    this.buttonManager.updateDepthUnitsButton(this.gameConfig.depth_unit);

    const customEvent = new CustomEvent('redraw-depth-info', {
      bubbles: true,
    });
    this.dispatchEvent(customEvent);
  }

  /**
   * Sets up the event listener for the message count input element.
   *
   * Attaches an 'input' event listener to the message count input element
   * within the shadow DOM. The listener triggers the handleMessageCountChange
   * method whenever the input value changes.
   */
  private setupMessageCountInput(): void {
    const messageCountInput = this.shadowRoot?.getElementById(
      'message-count-input',
    ) as HTMLInputElement;

    if (messageCountInput) {
      messageCountInput.addEventListener(
        'input',
        this.handleMessageCountChange,
      );
    }
  }

  /**
   * Handles the input event on the message count input element.
   *
   * @param {Event} event The input event from the message count input element.
   */
  private handleMessageCountChange = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    const valueDisplay = this.shadowRoot?.getElementById(
      'message-count-value',
    ) as HTMLDivElement;
    const newCount = parseInt(input.value, 10);

    if (!isNaN(newCount) && newCount >= 1 && newCount <= 50) {
      this.gameConfig.message_count = newCount;
      valueDisplay.textContent = newCount.toString();
    } else {
      input.value = this.gameConfig.message_count.toString();
    }

    const customEvent = new CustomEvent('redraw-message-display', {
      bubbles: true,
    });
    this.dispatchEvent(customEvent);
  };

  /**
   * Cycles through the blood intensity options (0 = no blood, 1 = light blood, 2 = medium blood, 3 = heavy blood).
   *
   * Updates the {@link gameConfig.blood_intensity} property, updates the blood intensity button,
   * and sets the blood intensity of the game.
   */
  private toggleBloodIntensity(): void {
    this.gameConfig.blood_intensity = (this.gameConfig.blood_intensity + 1) % 4;
    this.buttonManager.updateBloodIntensityButton(
      this.gameConfig.blood_intensity,
    );
  }

  /**
   * Returns to the ingame menu, saving the current game configuration.
   *
   * This function is called when the user clicks the "return to game" button on
   * the options screen. It saves the current game configuration to a file, and
   * then removes the options menu from the DOM.
   *
   * In the disconnect callback, it fires a custom event that renders the ingame menu.
   * This approach is needed to ensure that the menu is removed from the DOM before the ingame in drawn.
   * This allows the ingame menu to be conditionally drawn and prevents the ingame menu and the options menu to be shown at the same time.
   *
   * @return {Promise<void>} A promise that resolves when the configuration is
   * saved and the screen is updated.
   */
  private async returnToIngameMenu(): Promise<void> {
    try {
      await gameConfigManager.saveConfig();
    } catch (error) {
      console.error(error);
    }
    this.remove();
  }

  /**
   * Sets focus to the message count input element and selects its content.
   *
   * This function is called when the user presses the "e" key on the options menu.
   * It finds the input element in the shadow DOM and sets focus to it. To select
   * the content of the input element, it uses setTimeout to delay the selection
   * by 10 milliseconds, so that the focus event is processed before the selection
   * is triggered.
   */
  private focusAndSelectMessageCountInput(): void {
    const messageCountInput = this.shadowRoot?.getElementById(
      'message-count-input',
    ) as HTMLInputElement;
    if (messageCountInput) {
      messageCountInput.focus();
      setTimeout(() => {
        messageCountInput.select();
      }, 10);
    }
  }

  /**
   * Checks if the Alt or Meta key is pressed.
   */
  private isAltKeyPressed(event: KeyboardEvent): boolean {
    return event.altKey || event.metaKey;
  }

  /**
   * Handles key presses on the options menu.
   *
   * Listens for the following keys and calls the corresponding method to update the game configuration:
   * - C: toggleControlScheme
   * - S: toggleScanlines
   * - t: switchScanlineStyle
   * - M: toggleMessageAlignment
   * - e: focusAndSelectMessageCountInput
   * - p: toggleTemperatureUnitChange
   * - D: toggleDepthUnitChange
   * - o: toggleShowImages
   * - I: toggleImageAlignment
   * - B: toggleBloodIntensity
   * - {menu} or R: returnToIngameMenu
   *
   * @param event - The keyboard event to be handled.
   */
  private handleKeyPress(event: KeyboardEvent): void {
    // scroll via keypress when alt or meta key is pressed
    if (this.isAltKeyPressed(event)) {
      const ingameOptions = document.querySelector(
        'ingame-options',
      ) as HTMLElement;
      const targetElement = ingameOptions?.shadowRoot?.querySelector(
        '.options-menu',
      ) as HTMLElement;

      new KeypressScrollHandler(targetElement).handleVirtualScroll(event);
    }

    switch (event.key) {
      case 'y':
        this.toggleShowStory();
        break;
      case 'C':
        this.toggleControlScheme();
        break;
      case 'S':
        this.toggleScanlines();
        break;
      case 't':
        this.switchScanlineStyle();
        break;
      case 'F':
        this.toggleFlicker();
        break;
      case 'M':
        this.toggleMessageAlignment();
        break;
      case 'e':
        this.focusAndSelectMessageCountInput();
        break;
      case 'p':
        this.toggleTemperatureUnitChange();
        break;
      case 'D':
        this.toggleDepthUnitChange();
        break;
      case 'o':
        this.toggleShowImages();
        break;
      case 'I':
        this.toggleImageAlignment();
        break;
      case 'B':
        this.toggleBloodIntensity();
        break;
      case this.activeControlScheme.menu.toString():
      case 'R':
        this.returnToIngameMenu();
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
   * connectedCallback function, and dispatches a custom event to open the ingame menu.
   */
  disconnectedCallback(): void {
    const event = new CustomEvent('open-ingame-menu', {
      bubbles: true,
    });
    this.dispatchEvent(event);

    this.eventTracker.removeAll();
  }
}
