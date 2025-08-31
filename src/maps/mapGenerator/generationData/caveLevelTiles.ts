import { Glyph } from '../../../gameLogic/glyphs/glyph';
import { Tile } from '../../../shared-types/gameLogic/maps/mapGenerator/tile';

export const CAVE_LEVEL_TILES: Tile = {
  floor: [
    // Using weights, aiming for a rough base of 1000 for common things
    { glyph: Glyph.Regular_Floor, relativeWeight: 950 }, // Very common
    { glyph: Glyph.Spiky_Crystal, relativeWeight: 10 }, // Uncommon
    { glyph: Glyph.Glowing_Mushroom, relativeWeight: 10 }, // Uncommon
    { glyph: Glyph.Poison_Mushroom, relativeWeight: 10 }, // Uncommon
    { glyph: Glyph.Confusion_Mushroom, relativeWeight: 10 }, // Uncommon
    { glyph: Glyph.Arcane_Sigil, relativeWeight: 1 }, // Very rare
  ],
  wall: [
    // Using weights, aiming for a rough base of 1000 for common things
    { glyph: Glyph.Wall, relativeWeight: 500 }, // Common
    { glyph: Glyph.Rock, relativeWeight: 500 }, // Common
  ],
};
