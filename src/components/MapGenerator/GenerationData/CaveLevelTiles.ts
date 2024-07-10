import { Glyph } from '../../Glyphs/Glyph';
import { Tile } from '../Types/Tile';

export const CAVE_LEVEL_TILES: Tile = {
  floor: [
    { glyph: Glyph.Floor, occurrencePercentage: 90 },
    { glyph: Glyph.SpikyCrystal, occurrencePercentage: 1 },
  ],
  wall: [
    { glyph: Glyph.Wall, occurrencePercentage: 50 },
    { glyph: Glyph.Rock, occurrencePercentage: 50 },
  ],
};
