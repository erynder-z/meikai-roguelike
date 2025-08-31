import { Glyph } from '../../../../gameLogic/glyphs/glyph';

export type WeightedFeatureConfig = {
  glyph: Glyph;
  weight: number;
  minSize: number;
  maxSize: number;
  iterations: number;
};
