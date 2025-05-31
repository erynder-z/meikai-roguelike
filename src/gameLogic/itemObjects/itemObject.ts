import { Glyph } from '../glyphs/glyph';
import { GlyphMap } from '../glyphs/glyphMap';
import { ObjCategory } from './itemCategories';
import { Slot } from './slot';
import { Spell } from '../spells/spell';
import { SpellColors } from '../../colors/spellColors';

/**
 * Represents an item object in the game world.
 */
export class ItemObject {
  public id: string;
  constructor(
    public glyph: Glyph,
    public slot: Slot,
    public category: ObjCategory[] = [ObjCategory.Misc],
    public spell: Spell = Spell.None,
    public level: number = 1,
    public desc: string = 'some item without description',
    public charges: number = 1,
    public effectMagnitude: number | null = null, // float number between 0 and 1. 2 decimals. i,e 0.05.
  ) {
    this.id = crypto.randomUUID();
  }

  /**
   * Generates a description of the item object.
   * @returns {string} The description of the item object.
   */
  public description(): string {
    const label = this.name();

    if (this.spell != Spell.None) {
      const quality = SpellColors.c[this.spell][1];
      return `${quality} ${label}`;
    }

    return `${label}: ${this.level}`;
  }

  /**
   * Retrieves the name of the item based on its glyph.
   * @returns {string} The name of the item.
   */
  public name(): string {
    return GlyphMap.getGlyphInfo(this.glyph).name;
  }
}
