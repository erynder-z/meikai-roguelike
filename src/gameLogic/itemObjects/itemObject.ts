import { Glyph } from '../glyphs/glyph';
import { GlyphMap } from '../glyphs/glyphMap';
import { ObjCategory } from './itemCategories';
import { Slot } from './slot';
import { Spell } from '../spells/spell';
import { SpellColors } from '../../colors/spellColors';
import { SpellProperties } from './spellProperties';

/**
 * Represents an item object in the game world.
 */
export class ItemObject {
  public id: string;
  public spellCasting: SpellProperties;

  constructor(
    public glyph: Glyph,
    public slot: Slot,
    public category: ObjCategory[] = [ObjCategory.Misc],
    public level: number = 1,
  ) {
    this.id = crypto.randomUUID();
    this.spellCasting = new SpellProperties();
  }

  /**
   * Generates a description of the item object.
   *
   * @returns The description of the item object.
   */
  public description(): string {
    const label = this.name();

    if (this.spellCasting.spell != Spell.None) {
      const quality = SpellColors.c[this.spellCasting.spell][1];
      return `${quality} ${label}`;
    }

    return `${label}: ${this.level}`;
  }

  /**
   * Retrieves the name of the item based on its glyph.
   *
   * @returns The name of the item.
   */
  public name(): string {
    return GlyphMap.getGlyphInfo(this.glyph).name;
  }
}
