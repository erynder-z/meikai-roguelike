import { Glyph } from '../../../gameLogic/glyphs/glyph';
import { Tile } from '../../../shared-types/gameLogic/maps/mapGenerator/tile';

export const DEFAULT_LEVEL_TILES: Tile = {
  floor: [
    // Using weights, aiming for a rough base of 1000 for common things
    { glyph: Glyph.Regular_Floor, relativeWeight: 940 }, // Very common
    { glyph: Glyph.Spiky_Crystal, relativeWeight: 10 }, // Uncommon
    { glyph: Glyph.Lava, relativeWeight: 10 }, // Uncommon
    { glyph: Glyph.Glowing_Mushroom, relativeWeight: 10 }, // Uncommon
    { glyph: Glyph.Poison_Mushroom, relativeWeight: 10 }, // Uncommon
    { glyph: Glyph.Confusion_Mushroom, relativeWeight: 10 }, // Uncommon
    { glyph: Glyph.Hidden_Trap, relativeWeight: 10 }, // Uncommon
    { glyph: Glyph.Arcane_Sigil, relativeWeight: 1 }, // Very rare
  ],
  wall: [
    // Using weights, aiming for a rough base of 1000 for common things
    { glyph: Glyph.Wall, relativeWeight: 840 }, // Common
    { glyph: Glyph.Rock, relativeWeight: 100 }, // Less common
    { glyph: Glyph.Obsidian, relativeWeight: 50 }, // Uncommon
    { glyph: Glyph.Magnetite, relativeWeight: 5 }, // Rare
  ],
};
