export type Recipe = {
  ingredients: string[];
  result: RecipeResult;
};

export type RecipeResult = {
  glyph: string;
  slot: string;
  category: string[];
  level: number;
  initialization?: {
    spell?: string;
    charges?: {
      base: number;
    };
    effectMagnitude?: number | null;
  };
};
