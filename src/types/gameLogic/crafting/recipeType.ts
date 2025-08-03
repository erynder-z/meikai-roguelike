export type Recipe = {
    ingredients: string[];
    result: RecipeResult;
};

export type RecipeResult = {
    glyph: string;
    slot: string;
    category: string[];
    spell?: string;
    level: number;
    charges: number;
    effectMagnitude: number | null;
};
