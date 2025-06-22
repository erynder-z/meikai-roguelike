import { Glyph } from '../glyphs/glyph';
import { GlyphMap } from '../glyphs/glyphMap';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Represents the corpse of a mob.
 */
export class Corpse {
  public id: string = '';
  public pos: WorldPoint = new WorldPoint();
  public glyph: Glyph = Glyph.Unknown;
  public name: string = '?';
  public description: string = '';

  constructor(glyph: Glyph, x: number, y: number) {
    this.id = Glyph[glyph];
    this.glyph = glyph;
    this.name = Glyph[glyph];
    this.pos.x = x;
    this.pos.y = y;
  }

  /**
   * Creates a new Corpse object with the same glyph and position as the current object.
   * Sets the description of the corpse to the corpse glyph's description for the 'corpse' state.
   *
   * @return A new Corpse object with the same glyph and position as the current object.
   */
  public create(): Corpse {
    const corpse = new Corpse(this.glyph, this.pos.x, this.pos.y);
    corpse.name = GlyphMap.getGlyphInfo(this.glyph).name;
    corpse.description = GlyphMap.getGlyphDescription(this.glyph);
    return corpse;
  }
}
