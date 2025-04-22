export type BaseGlyph = {
  id: string;
  char: string;
  bgCol: string;
  fgCol: string;
  hasSolidBg: boolean;
  name: string;
  description: string;
  help?: {
    show: boolean;
    about: string;
  };
};

export type EnvironmentGlyph = {
  isOpaque: boolean;
  isBlockingMovement: boolean;
  isBlockingProjectiles: boolean;
  isDiggable: boolean;
  isCausingSlow: boolean;
  isCausingBurn: boolean;
  isMagnetic: boolean;
  isCausingBleed: boolean;
  isGlowing: boolean;
  isCausingPoison: boolean;
  isCausingConfusion: boolean;
  isCausingBlind: boolean;
  defaultBuffDuration?: number;
} & BaseGlyph;

/**
 * Represents a mob glyph.
 */
export type MobGlyph = {
  // Add any mob-specific properties here if needed
} & BaseGlyph;

/**
 * Represents an item glyph.
 */
export type ItemGlyph = {
  // Add any item-specific properties here if needed
} & BaseGlyph;

/**
 * Represents a corpse glyph.
 */
export type CorpseGlyph = {
  // Add any corpse-specific properties here if needed
} & BaseGlyph;
