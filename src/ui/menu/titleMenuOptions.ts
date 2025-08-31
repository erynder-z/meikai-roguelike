import controls from '../../controls/control_schemes.json';
import { ControlSchemeManager } from '../../controls/controlSchemeManager';
import { ControlSchemeName } from '../../shared-types/controls/controlScheme';
import { EventListenerTracker } from '../../utilities/eventListenerTracker';
import { FlickerManager } from '../../renderer/flickerManager';
import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { KeypressScrollHandler } from '../../utilities/KeypressScrollHandler';
import { LayoutManager } from '../layoutManager/layoutManager';
import { OptionsMenuButtonManager } from './buttonManager/optionsMenuButtonManager';
import { ScanlinesHandler } from '../../renderer/scanlinesHandler';
import { UnBlurElement } from '../other/unBlurElement';

export class TitleMenuOptions extends UnBlurElement {
  private eventTracker: EventListenerTracker;
  private layoutManager: LayoutManager;
  private buttonManager: OptionsMenuButtonManager;
  private gameConfig = gameConfigManager.getConfig();
  public controlSchemeManager: ControlSchemeManager;
  private currentScheme = this.gameConfig.control_scheme;
  private availableControlSchemes = Object.keys(
    controls,
  ) as ControlSchemeName[];
  private activeControlScheme: Record<string, string[]>;

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
   */
  connectedCallback(): void {
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
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          background: var(--backgroundDefaultTransparent);
          color: var(--white);
          z-index: 1;
          overflow-x: hidden;
        }

        .options-menu button {
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

        .options-menu button:hover {
          transform: translateX(8px) scale(1.05);
        }

        .underline {
          text-decoration: underline;
        }

        .info-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.5rem;
          min-width: 70ch;
        }

        .info-container button:nth-child(1) {
          transform: rotate(-0.3deg);
          margin-left: 0.2rem;
        }
        .info-container button:nth-child(2) {
          transform: rotate(0.6deg);
          margin-left: -0.2rem;
        }
        .info-container button:nth-child(3) {
          transform: rotate(-0.5deg);
          margin-left: 0.5rem;
        }
        .info-container button:nth-child(4) {
          transform: rotate(0.5deg);
          margin-left: -0.5rem;
        }
        .info-container button:nth-child(5) {
          transform: rotate(-0.2deg);
          margin-left: 0.3rem;
        }
        .info-container button:nth-child(6) {
          transform: rotate(0.6deg);
          margin-left: -0.3rem;
        }

        .info-span {
          font-size: 2.5rem;
          width: 45%;
        }

        .info-span::after {
          content: '';
          display: block;
          width: 100%;
          height: 2px;
          background-color: var(--white);
        }

        .info-container div {
          width: max-content;
          margin: 0 auto;
        }

        .explanation {
          font-size: 1rem;
          font-weight: normal;
          padding-top: 0.5rem;
        }

        .terminal-dimensions-input{
          font-family: 'UA Squared';
          background: none;
          border: none;
          border-bottom: 2px solid var(--white);
          color: var(--white);
          font-weight: bold;
          font-size: 2rem;
        }

        .terminal-dimensions-input:focus {
          outline: none;
        }

        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        .scaling-factor-input,
        .keypress-throttle-input,
        .message-count-input {
          -webkit-appearance: none;
          appearance: none;
          width: 66%;
          height: 1rem;
          background: var(--accent);
          outline: none;
          opacity: 0.7;
        }

        .scaling-factor-input::-webkit-slider-thumb,
        .keypress-throttle-input::-webkit-slider-thumb,
        .message-count-input::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 2rem;
          height: 2rem;
          background: var(--white);
        }

        .title {
          position: fixed;
          bottom: 0;
          left: 0;
          margin: 0 1rem;
          z-index: 1;
          font-size: 5rem;
        }

        .options-menu .back-button {
          position: fixed;
          bottom: 0;
          right: 0;
          margin: 0 1rem;
          z-index: 1;
          font-size: 2.5rem;
          transform: rotate(1.6deg);
        }
      </style>

      <div class="options-menu">
        <span class="info-span">Core</span>
        <div class="info-container">
          <button id="current-seed-button" class="current-seed-display">
            Current see<span class="underline">d</span>: ${this.gameConfig.seed}
          </button>
          <button id="current-font-button" class="current-font-display">
            Current terminal <span class="underline">f</span>ont:
            ${this.gameConfig.terminal.font} *
            <div class="explanation">
              * Add custom fonts by placing ttf-fonts in $APPDATA/fonts/
            </div>
          </button>
          <button class="terminal-dimensions-button">
            Current terminal dimensions ( <span class="underline">w</span>idth x <span class="underline">h</span>eight ):
            <input
              type="number"
              min="1"
              max="255"
              id="terminal-dimensions-width-input"
              class="terminal-dimensions-input"
              value="${this.gameConfig.terminal.dimensions.width}"
            /> x
            <input
              type="number"
              min="1"
              max="255"
              id="terminal-dimensions-height-input"
              class="terminal-dimensions-input"
              value="${this.gameConfig.terminal.dimensions.height}"
            /> *
            <div class="explanation">
              * Changing these will alter any saved games! 
            </div>
            <div class="explanation">
              * Recommended: 64 x 40 for 16:10 and 72 x 40 for 16:9 aspect ratio!
            </div>
          </button>
          <button id="scaling-factor-input-button">
            <label for="scaling-factor-input">
              Current terminal sca<span class="underline">l</span>ing factor:
            </label>
            <input
              type="range"
              step="0.1"
              min="0"
              max="2"
              id="scaling-factor-input"
              class="scaling-factor-input"
              value="${this.gameConfig.terminal.scaling_factor}"
            >
            <div id="scaling-factor-value" class="scaling-factor-value">
              ${this.gameConfig.terminal.scaling_factor}
            </div>
            </input>
            <div class="explanation">(Default: 0.8)</div>
          </button>
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
          <button id="keypress-throttle-input-button">
            <label for="keypress-throttle-input">
              Mi<span class="underline">n</span>imum keypress delay in milliseconds (0-250 ms):
            </label>
            <input
              type="range"
              min="0"
              max="250"
              id="keypress-throttle-input"
              class="keypress-throttle-input"
              value="${this.gameConfig.min_keypress_delay}"
            >
            <div id="keypress-throttle-value" class="keypress-throttle-value">
              ${this.gameConfig.min_keypress_delay}
            </div>
            </input>
            <div class="explanation">(Default: 50ms)</div>
          </button>
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
          <button id="toggle-glyph-shadow-button">
            Glyph sh<span class="underline">a</span>dow
          </button>
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
              min="1"
              max="50"
              id="message-count-input"
              class="message-count-input"
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
          <button id="weight-units-button">
            Wei<span class="underline">g</span>ht units
          </button>
        </div>
        <span class="info-span">Misc</span>
        <div class="info-container">
          <button id="blood-intensity-button">
            <span class="underline">B</span>lood intensity   
          </button>
        </div>
        <div class="title">Options</div>
        <button id="back-button" class="back-button">
          <span class="underline">R</span>eturn to previous menu
        </button>
      </div>
    `;

    this.shadowRoot?.appendChild(templateElement.content.cloneNode(true));

    super.connectedCallback();
    this.buttonManager.updateStoryToggleButton(this.gameConfig.show_story);
    this.buttonManager.updateControlSchemeButton(this.currentScheme);
    this.setupKeypressThrottleInput();
    this.buttonManager.updateScanlinesToggleButton(
      this.gameConfig.show_scanlines,
    );
    this.buttonManager.updateScanlineStyleButton(
      this.gameConfig.scanline_style,
    );
    this.buttonManager.updateFlickerToggleButton(this.gameConfig.show_flicker);
    this.buttonManager.updateGlyphShadowToggleButton(
      this.gameConfig.show_glyph_shadow,
    );
    this.buttonManager.updateMessageAlignButton(
      this.gameConfig.message_display,
    );
    this.buttonManager.updateTemperatureUnitsButton(
      this.gameConfig.temperature_unit,
    );
    this.buttonManager.updateDepthUnitsButton(this.gameConfig.depth_unit);
    this.buttonManager.updateWeightUnitsButton(this.gameConfig.weight_unit);
    this.buttonManager.updateShowImagesButton(this.gameConfig.show_images);
    this.buttonManager.updateImageAlignButton(this.gameConfig.image_display);
    this.setupScalingFactorInput();
    this.setupMessageCountInput();
    this.buttonManager.updateBloodIntensityButton(
      this.gameConfig.blood_intensity,
    );
    this.bindEvents();
    this.unBlur();
  }

  /**
   * Bind events to the elements inside the options menu.
   */
  private bindEvents(): void {
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.changeFont = this.changeFont.bind(this);
    this.changeSeed = this.changeSeed.bind(this);
    this.toggleShowStory = this.toggleShowStory.bind(this);
    this.toggleControlScheme = this.toggleControlScheme.bind(this);
    this.focusAndSelectKeypressThrottleInput =
      this.focusAndSelectKeypressThrottleInput.bind(this);
    this.toggleScanlines = this.toggleScanlines.bind(this);
    this.switchScanlineStyle = this.switchScanlineStyle.bind(this);
    this.toggleFlicker = this.toggleFlicker.bind(this);
    this.toggleMessageAlignment = this.toggleMessageAlignment.bind(this);
    this.toggleShowImages = this.toggleShowImages.bind(this);
    this.toggleImageAlignment = this.toggleImageAlignment.bind(this);
    this.focusAndSelectMessageCountInput =
      this.focusAndSelectMessageCountInput.bind(this);
    this.toggleTemperatureUnitChange =
      this.toggleTemperatureUnitChange.bind(this);
    this.toggleDepthUnitChange = this.toggleDepthUnitChange.bind(this);
    this.toggleWeightUnitChange = this.toggleWeightUnitChange.bind(this);
    this.toggleBloodIntensity = this.toggleBloodIntensity.bind(this);
    this.toggleGlyphShadow = this.toggleGlyphShadow.bind(this);
    this.returnToPreviousScreen = this.returnToPreviousScreen.bind(this);

    const root = this.shadowRoot;

    this.eventTracker.addById(
      root,
      'current-seed-button',
      'click',
      this.changeSeed,
    );
    this.eventTracker.addById(
      root,
      'current-font-button',
      'click',
      this.changeFont,
    );
    this.eventTracker.addById(
      root,
      'terminal-dimensions-width-input',
      'input',
      event => this.handleInputChange(event, 'terminal-width'),
    );
    this.eventTracker.addById(
      root,
      'terminal-dimensions-height-input',
      'input',
      event => this.handleInputChange(event, 'terminal-height'),
    );
    this.eventTracker.addById(root, 'scaling-factor-input', 'input', event =>
      this.handleInputChange(event, 'scaling'),
    );
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
      'keypress-throttle-input-button',
      'click',
      event => this.handleInputChange(event, 'keypress-throttle'),
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
      event => this.handleInputChange(event, 'message'),
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
      'weight-units-button',
      'click',
      this.toggleWeightUnitChange,
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
      this.returnToPreviousScreen,
    );

    this.eventTracker.add(
      document,
      'keydown',
      this.handleKeyPress as EventListener,
    );
  }

  /**
   * Sets up the event listener for the scaling factor input element.
   *
   * Attaches an 'input' event listener to the scaling factor input element
   * within the shadow DOM. The listener triggers the {@link handleInputChange}
   * method whenever the input value changes.
   */
  private setupScalingFactorInput(): void {
    const scalingFactorInput = this.shadowRoot?.getElementById(
      'scaling-factor-input',
    ) as HTMLInputElement;

    if (scalingFactorInput) {
      scalingFactorInput.addEventListener('input', event =>
        this.handleInputChange(event, 'scaling'),
      );
    }
  }

  /**
   * Sets up the event listener for the message count input element.
   *
   * Attaches an 'input' event listener to the message count input element
   * within the shadow DOM. The listener triggers the {@link handleInputChange}
   * method whenever the input value changes.
   */
  private setupMessageCountInput(): void {
    const messageCountInput = this.shadowRoot?.getElementById(
      'message-count-input',
    ) as HTMLInputElement;

    if (messageCountInput) {
      messageCountInput.addEventListener('input', event =>
        this.handleInputChange(event, 'message'),
      );
    }
  }

  /**
   * Sets up the event listener for the keypress throttle input element.
   *
   * Attaches an 'input' event listener to the keypress throttle input element
   * within the shadow DOM. The listener triggers the {@link handleInputChange}
   * method whenever the input value changes.
   */
  private setupKeypressThrottleInput(): void {
    const keypressThrottleInput = this.shadowRoot?.getElementById(
      'keypress-throttle-input',
    ) as HTMLInputElement;

    if (keypressThrottleInput) {
      keypressThrottleInput.addEventListener('input', event =>
        this.handleInputChange(event, 'keypress-throttle'),
      );
    }
  }

  /**
   * Sets focus to the terminal height input element and selects its content.
   *
   * This function is called when the user presses the "h" key on the options menu.
   * It finds the input element in the shadow DOM and sets focus to it. To select
   * the content of the input element, it uses setTimeout to delay the selection
   * by 10 milliseconds, so that the focus event is processed before the selection
   * is triggered.
   */
  private focusAndSelectTerminalHeightInput(): void {
    const heightInput = this.shadowRoot?.getElementById(
      'terminal-dimensions-height-input',
    ) as HTMLInputElement;
    if (heightInput) {
      heightInput.focus();
      setTimeout(() => {
        heightInput.select();
      }, 10);
    }
  }

  /**
   * Sets focus to the terminal width input element and selects its content.
   *
   * This function is called when the user presses the "w" key on the options menu.
   * It finds the input element in the shadow DOM and sets focus to it. To select
   * the content of the input element, it uses setTimeout to delay the selection
   * by 10 milliseconds, so that the focus event is processed before the selection
   * is triggered.
   */
  private focusAndSelectTerminalWidthInput(): void {
    const widthInput = this.shadowRoot?.getElementById(
      'terminal-dimensions-width-input',
    ) as HTMLInputElement;
    if (widthInput) {
      widthInput.focus();
      setTimeout(() => {
        widthInput.select();
      }, 10);
    }
  }

  /**
   * Sets focus to the scaling factor input element and selects its content.
   *
   * This function is called when the user presses the "l" key on the options menu.
   * It finds the input element in the shadow DOM and sets focus to it. To select
   * the content of the input element, it uses setTimeout to delay the selection
   * by 10 milliseconds, so that the focus event is processed before the selection
   * is triggered.
   */
  private focusAndSelectScalingFactorInput(): void {
    const scalingFactorInput = this.shadowRoot?.getElementById(
      'scaling-factor-input',
    ) as HTMLInputElement;
    if (scalingFactorInput) {
      scalingFactorInput.focus();
      setTimeout(() => {
        scalingFactorInput.select();
      }, 10);
    }
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
   * Sets focus to the keypress throttle input element and selects its content.
   *
   * This function is called when the user presses the "t" key on the options menu.
   * It finds the input element in the shadow DOM and sets focus to it. To select
   * the content of the input element, it uses setTimeout to delay the selection
   * by 10 milliseconds, so that the focus event is processed before the selection
   * is triggered.
   */
  private focusAndSelectKeypressThrottleInput(): void {
    const keypressThrottleInput = this.shadowRoot?.getElementById(
      'keypress-throttle-input',
    ) as HTMLInputElement;
    if (keypressThrottleInput) {
      keypressThrottleInput.focus();
      setTimeout(() => {
        keypressThrottleInput.select();
      }, 10);
    }
  }

  /**
   * Handles input change events for different configuration settings.
   *
   * Depending on the type of setting being changed, this method updates the
   * corresponding value in the game configuration by calling the appropriate
   * update method.
   *
   * @param event - The input event containing the new value.
   * @param type - The type of configuration setting being updated.
   */
  private handleInputChange = (
    event: Event,
    type:
      | 'message'
      | 'terminal-width'
      | 'terminal-height'
      | 'scaling'
      | 'keypress-throttle',
  ): void => {
    switch (type) {
      case 'message':
        this.updateMessageCountValue(event);
        break;
      case 'terminal-width':
        this.updateTerminalDimensionsValue(event, 'width');
        break;
      case 'terminal-height':
        this.updateTerminalDimensionsValue(event, 'height');
        break;
      case 'scaling':
        this.updateScalingFactorValue(event);
        break;
      case 'keypress-throttle':
        this.updateKeypressThrottleValue(event);
        break;
      default:
        break;
    }
  };

  /**
   * Updates the terminal dimensions when the user changes the input values.
   *
   * @param event - The input event.
   * @param side - The side of the terminal that is being updated.
   */
  private updateTerminalDimensionsValue(
    event: Event,
    side: 'width' | 'height',
  ): void {
    const input = event.target as HTMLInputElement;
    const newCount = parseInt(input.value, 10);

    if (!isNaN(newCount)) this.gameConfig.terminal.dimensions[side] = newCount;
  }

  /**
   * Updates the scaling factor for the terminal based on the user's input.
   *
   * Parses the input value from the event's target as a floating-point number and updates
   * the game configuration's terminal scaling factor if the value is a valid number within
   * the range of 0 to 2. If the value is not valid, resets the input to the current scaling
   * factor in the game configuration.
   *
   * @param event - The input event containing the new value for the scaling factor.
   */

  private updateScalingFactorValue(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valueDisplay = this.shadowRoot?.getElementById(
      'scaling-factor-value',
    ) as HTMLDivElement;
    const newCount = parseFloat(input.value);

    if (!isNaN(newCount) && newCount >= 0 && newCount <= 2) {
      this.gameConfig.terminal.scaling_factor = newCount;
      valueDisplay.textContent = newCount.toString();
    } else {
      input.value = this.gameConfig.terminal.scaling_factor.toString();
    }
  }

  /**
   * Updates the message count value based on the user's input.
   *
   * Parses the input value from the event's target and updates the game configuration's
   * message count if the value is a valid number within the range of 1 to 50. If the value
   * is not valid, resets the input to the current message count in the game configuration.
   *
   * @param event - The input event containing the new value for the message count.
   */

  private updateMessageCountValue(event: Event): void {
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
  }

  /**
   * Updates the minimum delay between key presses in milliseconds.
   *
   * Parses the input value from the event's target and updates the game configuration's
   * minimum key press delay if the value is a valid number within the range of 1 to 250.
   * If the value is not valid, resets the input to the current minimum key press delay
   * in the game configuration.
   *
   * @param event - The input event containing the new value for the minimum key press delay.
   */
  private updateKeypressThrottleValue(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valueDisplay = this.shadowRoot?.getElementById(
      'keypress-throttle-value',
    ) as HTMLDivElement;
    const newCount = parseInt(input.value, 10);

    if (!isNaN(newCount) && newCount >= 0 && newCount <= 250) {
      this.gameConfig.min_keypress_delay = newCount;
      valueDisplay.textContent = newCount.toString();
    } else {
      input.value = this.gameConfig.min_keypress_delay.toString();
    }
  }

  /**
   * Changes the current seed to a random value.
   *
   * This function will also update the displayed seed in the title menu.
   * @return A promise that resolves when the seed has been changed.
   */
  public async changeSeed(): Promise<void> {
    this.gameConfig.seed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
    this.buttonManager.displayCurrentSeed(this.gameConfig.seed);
  }

  /**
   * Cycles through the available fonts and updates the terminal font to the next one.
   *
   * This function retrieves all available font families from the document and finds the index of the current font in the list.
   * It then selects the next font in the list, updates the game configuration with this new font, and updates the displayed font in the UI.
   * The updated configuration is saved, and the layout manager is notified to update the font accordingly.
   *
   * @return A promise that resolves when the font has been changed and the configuration is saved.
   */

  public async changeFont(): Promise<void> {
    const fonts = Array.from(document.fonts).map(fontFace => fontFace.family);

    const currentFont = this.gameConfig.terminal.font;
    const index = fonts.indexOf(currentFont);

    const nextFontIndex = (index + 1) % fonts.length;
    const nextFont = fonts[nextFontIndex];

    this.gameConfig.terminal.font = nextFont;

    this.buttonManager.displayCurrentFont();

    this.layoutManager.updateFont();
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
   * Switches to the next scanline style in the sequence.
   *
   * Updates the {@link gameConfig.scanline_style} property to the next available
   * style in the list of scanline styles. The button text for the scanline style
   * is also updated to reflect the new style.
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
   * Toggles the glyph shadow setting on or off.
   *
   * Updates the {@link gameConfig.show_glyph_shadow} property, and updates the
   * button text based on the current state.
   */
  private toggleGlyphShadow(): void {
    this.gameConfig.show_glyph_shadow = !this.gameConfig.show_glyph_shadow;
    this.buttonManager.updateGlyphShadowToggleButton(
      this.gameConfig.show_glyph_shadow,
    );
  }

  /**
   * Toggles the message alignment between left and right.
   *
   * Updates the {@link gameConfig.message_display} property, updates the message
   * alignment button, and sets the layout of the main container based on the
   * current message alignment.
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

    this.layoutManager.setImageDisplay(this.gameConfig.show_images);
    this.buttonManager.updateShowImagesButton(this.gameConfig.show_images);
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

    this.layoutManager.setImageDisplayLayout(this.gameConfig.image_display);
    this.buttonManager.updateImageAlignButton(this.gameConfig.image_display);
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
   * Toggles the weight units between kilograms and pounds.
   *
   * Updates the {@link gameConfig.weight_unit} property, and updates the
   * weight units button.
   */
  private toggleWeightUnitChange(): void {
    this.gameConfig.weight_unit =
      this.gameConfig.weight_unit === 'kilograms' ? 'pounds' : 'kilograms';

    this.buttonManager.updateWeightUnitsButton(this.gameConfig.weight_unit);
  }

  /**
   * Cycles through the blood intensity options (0 = no blood, 1 = light blood, 2 = medium blood, 3 = heavy blood).
   *
   * Updates the {@link gameConfig.blood_intensity} property and the blood intensity button.
   */

  private toggleBloodIntensity(): void {
    this.gameConfig.blood_intensity = (this.gameConfig.blood_intensity + 1) % 4;
    this.buttonManager.updateBloodIntensityButton(
      this.gameConfig.blood_intensity,
    );
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
   * Checks if the Alt or Meta key is pressed.
   */
  private isAltKeyPressed(event: KeyboardEvent): boolean {
    return event.altKey || event.metaKey;
  }

  /**
   * Handles key presses on the options menu.
   *
   * This function is called whenever a key is pressed while the options menu is active.
   * It checks if the pressed key corresponds to one of the keys that can be used to control
   * the options menu, and if so, calls the appropriate function to handle the key press.
   * If the pressed key does not match any of the handled keys, the function does nothing.
   *
   * @param event - The keyboard event to be handled.
   */
  private handleKeyPress(event: KeyboardEvent): void {
    // scroll via keypress when alt or meta key is pressed
    if (this.isAltKeyPressed(event)) {
      const titleScreen = document.querySelector('title-screen') as HTMLElement;
      const content = titleScreen?.shadowRoot?.querySelector(
        '.content',
      ) as HTMLElement;
      const menuOptions = content?.querySelector(
        'title-menu-options',
      ) as HTMLElement;
      const targetElement = menuOptions?.shadowRoot?.querySelector(
        '.options-menu',
      ) as HTMLElement;

      new KeypressScrollHandler(targetElement).handleVirtualScroll(event);
    }

    switch (event.key) {
      case 'd':
        this.changeSeed();
        break;
      case 'f':
        this.changeFont();
        break;
      case 'w':
        event.preventDefault();
        this.focusAndSelectTerminalWidthInput();
        break;
      case 'h':
        event.preventDefault();
        this.focusAndSelectTerminalHeightInput();
        break;
      case 'l':
        event.preventDefault();
        this.focusAndSelectScalingFactorInput();
        break;
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
      case 'a':
        this.toggleGlyphShadow();
        break;
      case 'M':
        this.toggleMessageAlignment();
        break;
      case 'e':
        this.focusAndSelectMessageCountInput();
        break;
      case 'o':
        this.toggleShowImages();
        break;
      case 'I':
        this.toggleImageAlignment();
        break;
      case 'p':
        this.toggleTemperatureUnitChange();
        break;
      case 'D':
        this.toggleDepthUnitChange();
        break;
      case 'g':
        this.toggleWeightUnitChange();
        break;
      case 'B':
        this.toggleBloodIntensity();
        break;
      case 'n':
        this.focusAndSelectKeypressThrottleInput();
        break;
      case this.activeControlScheme.menu.toString():
      case 'R':
        this.returnToPreviousScreen();
        break;
      default:
        break;
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
