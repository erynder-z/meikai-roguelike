import { GlyphInfo } from './glyphInfo';
import { Glyph } from './glyph';

/**
 * Represents a map of glyphs and their corresponding information.
 */
export class GlyphMap {
  /**
   * A map containing information about each glyph.
   * Key: Glyph enum value
   * Value: GlyphInfo instance
   */
  private static glyphsRegistry: Map<Glyph, GlyphInfo> = new Map();

  /**
   * Information about the default or "bad" glyph.
   */
  public static bad: GlyphInfo = new GlyphInfo(
    'Bad', // id
    'red', // bgCol
    'yellow', // fgCol
    false, // hasSolidBg
    '?', // char
    'bad', // name
    'an unknown glyph', // description
    true, // isOpaque
    false, // isBlockingMovement
    false, // isBlockingProjectiles
    false, // isDiggable
    false, // isCausingSlow
    false, // isCausingBurn
    false, // isMagnetic
    false, // isCausingBleed
    false, // isGlowing
    false, // isCausingPoison
    false, // isCausingConfusion
    false, // isCausingBlind
    0, // defaultBuffDuration
  );

  /**
   * Retrieves the information of a glyph.
   *
   * If the glyph is unknown, it returns the default or "bad" glyph information.
   *
   * @param {Glyph} glyph - The glyph to retrieve the information for.
   * @return {GlyphInfo} The information of the glyph, or the default glyph if not found.
   */
  public static getGlyphInfo(glyph: Glyph): GlyphInfo {
    return GlyphMap.glyphsRegistry.get(glyph) || GlyphMap.bad;
  }

  /**
   * Adds a glyph to the GlyphMap.
   *
   * @param {GlyphInfo} info - The information of the glyph to add.
   * @returns {void}
   */
  public static addGlyph(info: GlyphInfo): void {
    const glyph = Glyph[info.id as keyof typeof Glyph];
    if (glyph === undefined) {
      console.warn(`Glyph ID "${info.id}" is not defined in Glyph enum.`);
      return;
    }
    GlyphMap.glyphsRegistry.set(glyph, info);
    /*   GlyphMap.warn(glyph); */
  }

  /**
   * Warns if a glyph is added but the registry size does not match the length of the Glyph enum.
   *
   * This can happen when a glyph is added in the code but the enum is not updated.
   * @param {Glyph} glyph - The glyph to warn about.
   * @returns {void}
   */
  private static warn(glyph: Glyph): void {
    if (GlyphMap.glyphsRegistry.size === Object.keys(Glyph).length) return;

    console.error(
      `Glyph ${Glyph[glyph]} differs from registry size ${GlyphMap.glyphsRegistry.size}`,
    );
  }

  /**
   * Converts an index to a glyph.
   *
   * The index is relative to the order of glyphs in the registry. This order is
   * defined by the order in which glyphs are added to the registry. If the index
   * is out of bounds, an error is thrown.
   *
   * @param {number} index - The index to convert to a glyph.
   * @return {Glyph} The glyph at the given index.
   * @throws {Error} If the index is out of bounds.
   */
  public static indexToGlyph(index: number): Glyph {
    const keys = Array.from(GlyphMap.glyphsRegistry.keys());
    if (index < 0 || index >= keys.length) {
      throw new Error(`Index ${index} is out of bounds.`);
    }
    return keys[index];
  }

  /**
   * Retrieves the description of a glyph.
   *
   * If the glyph is not found or does not have a description, "no description" is returned.
   * @param {Glyph} glyph - The glyph to retrieve the description for.
   * @return {string} The description of the glyph, or "no description".
   */
  public static getGlyphDescription(glyph: Glyph): string {
    const info = GlyphMap.glyphsRegistry.get(glyph);
    return info?.description || 'no description';
  }

  /**
   * Retrieves the default buff duration for an environment glyph.
   *
   * If the glyph is not found or does not have a default buff duration, 1 is returned.
   * @param {Glyph} glyph - The glyph to retrieve the default buff duration for.
   * @return {number} The default buff duration for the glyph, or 1.
   */
  public static getEnvDefaultBuffDuration(glyph: Glyph): number {
    const info = GlyphMap.glyphsRegistry.get(glyph);
    return info?.defaultBuffDuration || 0;
  }

  /**
   * Returns the number of glyphs in the registry.
   *
   * @return {number} The number of glyphs in the registry.
   */
  public static getRegistrySize(): number {
    return GlyphMap.glyphsRegistry.size;
  }

  /**
   * Returns an array of all glyphs in the registry.
   *
   * @return {Array<GlyphInfo>} An array of all glyphs in the registry.
   */
  public static getAllGlyphs(): Array<GlyphInfo> {
    return Array.from(GlyphMap.glyphsRegistry.values());
  }
}
