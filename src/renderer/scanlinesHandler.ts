import { gameConfigManager } from '../gameConfigManager/gameConfigManager';

export type ScanlineStyles =
  | 'subtle'
  | 'light'
  | 'medium'
  | 'dark'
  | 'green'
  | 'diagonal'
  | 'vertical'
  | 'lcd'
  | 'shadowMask'
  | 'interlaced'
  | 'static'
  | 'rainbow'
  | 'anaglyph';

/**
 * Handles the display of scanlines a scanline effect.
 */
export class ScanlinesHandler {
  private static styleClassMap: Record<ScanlineStyles, string> = {
    subtle: 'scanlines-subtle',
    light: 'scanlines-light',
    medium: 'scanlines-medium',
    dark: 'scanlines-dark',
    green: 'scanlines-green',
    diagonal: 'scanlines-diagonal',
    vertical: 'scanlines-vertical',
    lcd: 'scanlines-lcd',
    shadowMask: 'scanlines-shadowMask',
    interlaced: 'scanlines-interlaced',
    static: 'scanlines-static',
    rainbow: 'scanlines-rainbow',
    anaglyph: 'scanlines-anaglyph',
  };

  public static SCANLINES_STYLES = Object.keys(
    ScanlinesHandler.styleClassMap,
  ) as ScanlineStyles[];

  /**
   * Toggles the display of a scanline effect on the given container.
   *
   * If gameConfig.show_scanlines is true, applies the scanline style specified
   * by gameConfig.scanline_style to the container. Otherwise, removes any
   * scanline styles from the container.
   *
   * @param container The element to which the scanline style should be applied.
   */
  public static handleScanlines(container: HTMLElement): void {
    const gameConfig = gameConfigManager.getConfig();
    if (gameConfig.show_scanlines) {
      const style = gameConfig.scanline_style as ScanlineStyles;
      this.applyScanlineStyle(container, style);
    } else {
      this.removeScanlinesFromContainer(container);
    }
  }

  /**
   * Applies a scanline style to the given container.
   *
   * Removes any existing scanline styles from the container, and then adds the
   * class name associated with the given style from the styleClassMap.
   *
   * Logs the given style and the associated class name to the console.
   *
   * Does nothing if the style is not a valid key in the styleClassMap.
   *
   * @param container - The container to apply the scanline style to.
   * @param style - The scanline style to apply.
   */
  public static applyScanlineStyle(
    container: HTMLElement,
    style: ScanlineStyles,
  ): void {
    this.clearScanlineStyles(container);
    const styleClass = this.styleClassMap[style] as ScanlineStyles;

    if (styleClass) container.classList.add(styleClass);
  }

  /**
   * Removes all scanline styles from the given container.
   *
   * Iterates over the values of the styleClassMap and removes each class name
   * from the container's class list.
   *
   * @param container - The container from which to remove the
   * scanline styles.
   */
  private static clearScanlineStyles(container: HTMLElement): void {
    Object.values(this.styleClassMap).forEach(styleClass => {
      container.classList.remove(styleClass);
    });
  }

  /**
   * Removes all scanline styles from the given container, effectively disabling
   * the display of any scanline effect.
   *
   * Calls clearScanlineStyles to remove all scanline-related class names from
   * the container's class list.
   *
   * @param container - The container from which to remove the scanline styles.
   */
  public static removeScanlinesFromContainer(container: HTMLElement): void {
    this.clearScanlineStyles(container);
  }
}
