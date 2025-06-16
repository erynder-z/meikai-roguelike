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
   * Updates the displayed text of the control scheme button to reflect the current active control scheme.
   *
   * @param { 'default' | 'alternate' } text - The current active control scheme.
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
   * @param {boolean} areScanlinesEnabled - Indicates if scanlines are currently enabled.
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
   * @param {string} scanlineStyle - The current scanline style, one of the values in the ScanlineStyles enum.
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
   * Updates the text of the message alignment button based on the current
   * message alignment.
   *
   * Sets the button's text to 'Message display: LEFT' or 'Message display:
   * RIGHT', depending on the current message alignment.
   *
   * @param {('left' | 'right')} messageAlignment - The current message alignment.
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
   * @param {boolean} areImagesDisplayed - Indicates if images are currently displayed.
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
   * @param {('left' | 'right')} imageAlignment - The current image alignment.
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
   * Updates the text of the blood intensity button based on the current blood intensity.
   *
   * Sets the button's text to 'Blood intensity: OFF', 'Blood intensity: NORMAL',
   * 'Blood intensity: HIGH', or 'Blood intensity: ULTRA', depending on the current
   * blood intensity.
   *
   * @param {number} bloodIntensity - The current blood intensity, one of the values in the BloodIntensity enum.
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
   * Displays the current seed in the title menu.
   *
   * @param {GameConfigType['seed']} seed - The current seed.
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
