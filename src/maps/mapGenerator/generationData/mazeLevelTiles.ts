import { Glyph } from '../../../gameLogic/glyphs/glyph';
import { Tile } from '../../../shared-types/gameLogic/maps/mapGenerator/tile';

export const MAZE_LEVEL_TILES: Tile = {
  floor: [
    // Using weights, aiming for a rough base of 1000 for common things
    { glyph: Glyph.Regular_Floor, relativeWeight: 1000 }, // Common
    { glyph: Glyph.Arcane_Sigil, relativeWeight: 1 }, // Very rare
  ],
  // Using weights, aiming for a rough base of 1000 for common things
  wall: [{ glyph: Glyph.Obsidian, relativeWeight: 1000 }], // Common
};
