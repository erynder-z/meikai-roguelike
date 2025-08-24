import { gameConfigManager } from '../../../gameConfigManager/gameConfigManager';
import { GameConfigType } from '../../../types/gameConfig/gameConfigType';
import { ScanlineStyles } from '../../../renderer/scanlinesHandler';
/**
 * Handles changing the displayed content of buttons on the options menu.
 */
export class OptionsMenuButtonManager {
  private shadowRoot: ShadowRoot;
  private gameConfig = gameConfigManager.getConfig();
  private shouldDisableScanlineStyleButton = !this.gameConfig.show_scanlines;
  public shouldDisableImageAlignButton = !this.gameConfig.show_images;

  constructor(shadowRoot: ShadowRoot) {
    this.shadowRoot = shadowRoot;
  }

  /**
   * Updates the text of the story toggle button based on whether the story
   * feature is enabled.
   *
   * Displays 'Show story: YES' if the story is enabled, otherwise displays
   * 'Show story: NO'.
   *
   * @param isStoryEnabled - Indicates if the story feature is currently enabled.
   */

  public updateStoryToggleButton(isStoryEnabled: boolean): void {
    const storyButton = this.shadowRoot?.getElementById('toggle-story-button');
    if (storyButton) {
      storyButton.innerHTML = `Show stor<span class="underline">y</span>: ${isStoryEnabled ? 'YES' : 'NO'}`;
    }
  }

  /**
   * Updates the displayed text of the control scheme button to reflect the current active control scheme.
   *
   * @param text - The current active control scheme.
   */
  public updateControlSchemeButton(
    text: GameConfigType['control_scheme'],
  ): void {
    const controlSchemeButton = this.shadowRoot?.getElementById(
      'switch-controls-button',
    );

    if (controlSchemeButton) {
      controlSchemeButton.innerHTML = `<span class="underline">C</span>ontrol scheme: ${text.toLocaleUpperCase()}`;
    }
  }

  /**
   * Updates the text and state of the scanlines toggle button based on whether
   * scanlines are enabled.
   *
   * Sets the button's text to 'Scanlines ON' or 'Scanlines OFF' depending on
   * the current state. Also updates the disabled state of the scanline style
   * button.
   *
   * @param areScanlinesEnabled - Indicates if scanlines are currently enabled.
   */
  public updateScanlinesToggleButton(areScanlinesEnabled: boolean): void {
    const scanlinesButton = this.shadowRoot?.getElementById(
      'toggle-scanlines-button',
    );
    if (scanlinesButton) {
      this.shouldDisableScanlineStyleButton = !areScanlinesEnabled;
      scanlinesButton.innerHTML = `<span class="underline">S</span>canlines ${areScanlinesEnabled ? 'ON' : 'OFF'}`;
    }
  }

  /**
   * Updates the text and state of the scanline style button based on the current
   * scanline style and whether scanlines are enabled.
   *
   * Sets the button's text to 'Scanlines style: <current style>' and also
   * updates the disabled state based on whether scanlines are enabled.
   *
   * @param scanlineStyle - The current scanline style, one of the values in the ScanlineStyles enum.
   */
  public updateScanlineStyleButton(scanlineStyle: ScanlineStyles): void {
    const scanLineStyleBtn = this.shadowRoot?.getElementById(
      'switch-scanline-style-button',
    );

    if (scanLineStyleBtn) {
      scanLineStyleBtn.innerHTML = `Scanlines s<span class="underline">t</span>yle: ${scanlineStyle.toUpperCase()}`;

      scanLineStyleBtn.classList.toggle(
        'disabled',
        this.shouldDisableScanlineStyleButton,
      );
    }
  }

  /**
   * Updates the text of the flicker toggle button based on whether flicker is enabled.
   *
   * @param isFlickerEnabled - Indicates if flicker is currently enabled.
   */
  public updateFlickerToggleButton(isFlickerEnabled: boolean): void {
    const flickerButton = this.shadowRoot?.getElementById(
      'toggle-flicker-button',
    );
    if (flickerButton) {
      flickerButton.innerHTML = `<span class="underline">F</span>licker ${isFlickerEnabled ? 'ON' : 'OFF'}`;
    }
  }

  /**
   * Updates the text of the message alignment button based on the current
   * message alignment.
   *
   * Sets the button's text to 'Message display: LEFT' or 'Message display:
   * RIGHT', depending on the current message alignment.
   *
   * @param messageAlignment - The current message alignment.
   */
  public updateMessageAlignButton(messageAlignment: 'left' | 'right'): void {
    const messageAlignBtn = this.shadowRoot?.getElementById(
      'message-display-align-button',
    ) as HTMLButtonElement;

    if (messageAlignBtn)
      messageAlignBtn.innerHTML = `<span class="underline">M</span>essage display: ${messageAlignment.toUpperCase()}`;
  }

  /**
   * Updates the text of the show images button based on the current display status.
   *
   * Sets the button's text to 'Show images: YES' if images are displayed,
   * and 'Show images: NO' otherwise.
   *
   * @param areImagesDisplayed - Indicates if images are currently displayed.
   */
  public updateShowImagesButton(areImagesDisplayed: boolean): void {
    const displayImage = this.shadowRoot?.getElementById(
      'show-images-button',
    ) as HTMLButtonElement;

    if (displayImage)
      displayImage.innerHTML = `Sh<span class="underline">o</span>w images: ${areImagesDisplayed ? 'YES' : 'NO'}`;
  }

  /**
   * Updates the text of the image alignment button based on the current
   * image alignment. Also updates the disabled status of the button
   * based on the current show images setting.
   *
   * Sets the button's text to 'Image display: LEFT' or 'Image display:
   * RIGHT', depending on the current image alignment.
   *
   * @param imageAlignment - The current image alignment.
   */
  public updateImageAlignButton(imageAlignment: 'left' | 'right'): void {
    const imageAlignBtn = this.shadowRoot?.getElementById(
      'image-align-button',
    ) as HTMLButtonElement;

    if (imageAlignBtn) {
      imageAlignBtn.innerHTML = `<span class="underline">I</span>mage display: ${imageAlignment.toUpperCase()}`;

      imageAlignBtn.classList.toggle(
        'disabled',
        this.shouldDisableImageAlignButton,
      );
    }
  }

  /**
   * Updates the text of the temperature units button based on the current
   * temperature units. Also forces a redraw of the misc info display
   * (which includes the current temperature).
   *
   * Sets the button's text to 'Temperature units: CELSIUS' or 'Temperature
   * units: FAHRENHEIT', depending on the current unit.
   *
   * @param unit - The current temperature unit.
   */
  public updateTemperatureUnitsButton(unit: 'celsius' | 'fahrenheit'): void {
    const temperatureUnitsBtn = this.shadowRoot?.getElementById(
      'temperature-units-button',
    ) as HTMLButtonElement;

    if (temperatureUnitsBtn) {
      temperatureUnitsBtn.innerHTML = `Tem<span class="underline">p</span>erature units: ${unit.toUpperCase()}`;
    }
  }

  /**
   * Updates the text of the depth units button based on the current
   * depth units.
   *
   * Sets the button's text to 'Depth units: METERS' or 'Depth units: FEET',
   * depending on the current unit.
   *
   * @param unit - The current depth unit.
   */

  public updateDepthUnitsButton(unit: 'meters' | 'feet'): void {
    const depthUnitsBtn = this.shadowRoot?.getElementById(
      'depth-units-button',
    ) as HTMLButtonElement;

    if (depthUnitsBtn) {
      depthUnitsBtn.innerHTML = `<span class="underline">D</span>epth units: ${unit.toUpperCase()}`;
    }
  }

  /**
   * Updates the text of the weight units button based on the current
   * weight units.
   *
   * Sets the button's text to 'Weight units: KILOGRAMS' or 'Weight units: POUNDS',
   * depending on the current unit.
   *
   * @param unit - The current weight unit.
   */
  public updateWeightUnitsButton(unit: 'kilograms' | 'pounds'): void {
    const weightUnitsBtn = this.shadowRoot?.getElementById(
      'weight-units-button',
    ) as HTMLButtonElement;

    if (weightUnitsBtn) {
      weightUnitsBtn.innerHTML = `Wei<span class="underline">g</span>ht units: ${unit.toUpperCase()}`;
    }
  }

  /**
   * Updates the text of the blood intensity button based on the current blood intensity.
   *
   * Sets the button's text to 'Blood intensity: OFF', 'Blood intensity: NORMAL', 'Blood intensity: HIGH', or 'Blood intensity: ULTRA', depending on the current blood intensity.
   *
   * @param bloodIntensity - The current blood intensity, one of the values in the BloodIntensity enum.
   */
  public updateBloodIntensityButton(bloodIntensity: number): void {
    const bloodIntensityBtn = this.shadowRoot?.getElementById(
      'blood-intensity-button',
    ) as HTMLButtonElement;

    if (!bloodIntensityBtn) return;

    const bloodLevels = ['OFF', 'NORMAL', 'HIGH', 'ULTRA'];
    const text = bloodLevels[bloodIntensity] ?? 'UNKNOWN';

    bloodIntensityBtn.innerHTML = `<span class="underline">B</span>lood intensity: ${text}`;
  }

  /**
   * Updates the text of the glyph shadow toggle button based on whether
   * glyph shadow is enabled.
   *
   * @param isGlyphShadowEnabled - Indicates if glyph shadow is currently enabled.
   */
  public updateGlyphShadowToggleButton(isGlyphShadowEnabled: boolean): void {
    const glyphShadowButton = this.shadowRoot?.getElementById(
      'toggle-glyph-shadow-button',
    );
    if (glyphShadowButton) {
      glyphShadowButton.innerHTML = `Glyph sh<span class="underline">a</span>dow ${isGlyphShadowEnabled ? 'ON' : 'OFF'}`;
    }
  }

  /**
   * Displays the current seed in the title menu.
   *
   * @param seed - The current seed.
   */
  public displayCurrentSeed(seed: GameConfigType['seed']): void {
    const seedButton = this.shadowRoot?.getElementById(
      'current-seed-button',
    ) as HTMLDivElement;
    if (seedButton) seedButton.innerHTML = `Current seed: ${seed}`;
  }

  /**
   * Updates the displayed font in the title menu to the current font.
   *
   * This function is called when the font is changed, and will update the displayed
   * font in the title menu.
   */
  public displayCurrentFont(): void {
    const fontButton = this.shadowRoot?.getElementById(
      'current-font-button',
    ) as HTMLDivElement;
    if (fontButton)
      fontButton.innerHTML = `Current terminal font: ${this.gameConfig.terminal.font}  <div class="explanation"> * Add custom fonts by placing ttf-fonts in $APPDATA/fonts/</div>  `;
  }
}
