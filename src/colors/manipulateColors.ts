export class ManipulateColors {
  /**
   * Darkens a hex color by a given factor.
   *
   * @param hexColor - The hex color to darken.
   * @param factor - The factor by which to darken the color.
   * @return The darkened hex color.
   */
  public static darkenColor(hexColor: string, factor: number): string {
    if (hexColor.startsWith('#')) {
      hexColor = hexColor.slice(1);
    }

    let r = parseInt(hexColor.slice(0, 2), 16);
    let g = parseInt(hexColor.slice(2, 4), 16);
    let b = parseInt(hexColor.slice(4, 6), 16);

    r = Math.floor(r * (1 - factor));
    g = Math.floor(g * (1 - factor));
    b = Math.floor(b * (1 - factor));

    const darkenedColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    return darkenedColor;
  }

  /**
   * Tints the given hex color with pink based on the provided factor.
   *
   * @param hexColor - The hex color to tint.
   * @param factor - The factor by which to tint the color.
   * @return The tinted hex color.
   */
  public static tintWithPink(hexColor: string, factor: number): string {
    if (hexColor.startsWith('#')) {
      hexColor = hexColor.slice(1);
    }

    let r = parseInt(hexColor.slice(0, 2), 16);
    let g = parseInt(hexColor.slice(2, 4), 16);
    let b = parseInt(hexColor.slice(4, 6), 16);

    r = Math.min(255, Math.floor(r + (255 - r) * factor));
    g = Math.floor(g * (1 - factor));
    b = Math.min(255, Math.floor(b + (255 - b) * factor));

    const tintedColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    return tintedColor;
  }

  /**
   * Tints the given hex color with red based on the provided factor.
   *
   * @param hexColor - The hex color to tint.
   * @param factor - The factor by which to tint the color.
   * @return The tinted hex color.
   */
  public static tintWithRed(hexColor: string, factor: number): string {
    if (hexColor.startsWith('#')) {
      hexColor = hexColor.slice(1);
    }

    let r = parseInt(hexColor.slice(0, 2), 16);
    let g = parseInt(hexColor.slice(2, 4), 16);
    let b = parseInt(hexColor.slice(4, 6), 16);

    r = Math.min(255, Math.floor(r + (255 - r) * factor));
    g = Math.floor(g * (1 - factor));
    b = Math.floor(b * (1 - factor));

    const tintedColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    return tintedColor;
  }

  /**
   * Tints the given hex color with green based on the provided factor.
   *
   * @param hexColor - The hex color to tint.
   * @param factor - The factor by which to tint the color.
   * @return The tinted hex color.
   */
  public static tintWithGreen(hexColor: string, factor: number): string {
    if (hexColor.startsWith('#')) {
      hexColor = hexColor.slice(1);
    }

    let r = parseInt(hexColor.slice(0, 2), 16);
    let g = parseInt(hexColor.slice(2, 4), 16);
    let b = parseInt(hexColor.slice(4, 6), 16);

    r = Math.floor(r * (1 - factor));
    g = Math.min(255, Math.floor(g + (255 - g) * factor));
    b = Math.floor(b * (1 - factor));

    const tintedColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    return tintedColor;
  }

  /**
   * Tints the given hex color with yellow based on the provided factor.
   *
   * @param hexColor - The hex color to tint. It should start with a '#' character.
   * @param factor - The factor by which to tint the color. A value of 0 will return the original color, a value of 1 will return the most yellow color possible.
   * @return The tinted hex color.
   */
  public static tintWithYellow(hexColor: string, factor: number): string {
    if (hexColor.startsWith('#')) {
      hexColor = hexColor.slice(1);
    }

    let r = parseInt(hexColor.slice(0, 2), 16);
    let g = parseInt(hexColor.slice(2, 4), 16);
    let b = parseInt(hexColor.slice(4, 6), 16);

    r = Math.min(255, Math.floor(r + (255 - r) * factor));
    g = Math.min(255, Math.floor(g + (255 - g) * factor));
    b = Math.floor(b * (1 - factor));

    const tintedColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

    return tintedColor;
  }

  /**
   * Tints the given hex color with blue based on the provided factor.
   *
   * @param hexColor - The hex color to tint. It should start with a '#' character.
   * @param factor - The factor by which to tint the color. A value of 0 will return the original color, a value of 1 will return the most blue color possible.
   * @return The tinted hex color.
   */
  public static tintWithBlue(hexColor: string, factor: number): string {
    if (hexColor.startsWith('#')) {
      hexColor = hexColor.slice(1);
    }

    const r = parseInt(hexColor.slice(0, 2), 16);
    const g = parseInt(hexColor.slice(2, 4), 16);
    const b = parseInt(hexColor.slice(4, 6), 16);

    const newR = Math.floor(r * (1 - factor));
    const newG = Math.floor(g * (1 - factor));
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Tints the given hex color with blood-like intensity based on the provided factor.
   *
   * @param hexColor - The hex color to tint. It should start with a '#' character.
   * @param factor - The factor by which to tint the color. A value of 0 will return the original color, while a value close to 1 will result in a more blood-like tint.
   * @return The tinted hex color.
   */

  public static tintWithBlood(hexColor: string, factor: number): string {
    if (hexColor.startsWith('#')) {
      hexColor = hexColor.slice(1);
    }

    // Ensure factor is between 0 and 2 in order to prevent invalid color values
    factor = Math.min(factor, 2);

    const r = parseInt(hexColor.slice(0, 2), 16);
    const g = parseInt(hexColor.slice(2, 4), 16);
    const b = parseInt(hexColor.slice(4, 6), 16);

    const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
    const newG = Math.min(255, Math.floor(g * (1 - factor * 0.5)));
    const newB = Math.min(255, Math.floor(b * (1 - factor * 0.5)));

    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Converts a hex color to an rgba color string.
   *
   * @param hex - The hex color to convert.
   * @param transparency - The transparency of the color. A value of 0 will return a completely transparent color, a value of 1 will return a completely opaque color.
   * @return The rgba color string.
   */
  public static hexToRgba(hex: string, transparency: number): string {
    transparency = Math.max(0, Math.min(1, transparency));

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${transparency})`;
  }
}
