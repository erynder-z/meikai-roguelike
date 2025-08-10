import recipesData from './recipes.json';
import { Inventory } from '../inventory/inventory';
import { ItemObject } from '../itemObjects/itemObject';
import { Glyph } from '../glyphs/glyph';
import { GlyphMap } from '../glyphs/glyphMap';
import { Slot } from '../itemObjects/slot';
import { ObjCategory } from '../itemObjects/itemCategories';
import { Spell } from '../spells/spell';
import {
  Recipe,
  RecipeResult,
} from '../../types/gameLogic/crafting/recipeType';

/**
 * Class responsible for handling item crafting logic.
 */
export class CraftingHandler {
  private recipes: Map<string, RecipeResult> = new Map();
  public maxIngredients: number;

  constructor(
    public inventory: Inventory,
    maxIngredients: number,
  ) {
    this.loadRecipes();
    this.maxIngredients = maxIngredients;
  }

  /**
   * Loads the recipes from the recipes.json file.
   *
   * The recipes are stored in a Map, where the key is a colon-separated string of
   * lower-case ingredient names, sorted alphabetically. This allows for quick lookups
   * of recipes by ingredient combination.
   */
  private loadRecipes() {
    const recipes: Recipe[] = recipesData.recipes;
    for (const recipe of recipes) {
      const key = recipe.ingredients
        .map(i => i.toLowerCase())
        .sort()
        .join(':');
      this.recipes.set(key, recipe.result);
    }
  }

  /**
   * Tries to combine a list of items using a recipe.
   *
   * The given items are removed from the inventory, and if a matching recipe is found,
   * the resulting item is returned.
   *
   * If no matching recipe is found, a "junk" item is returned.
   *
   * @param  {...ItemObject} items - The items to combine.
   * @returns ItemObject | null - The new item or null if no matching recipe is found.
   */
  public combine(...items: ItemObject[]): ItemObject | null {
    if (items.length === 0 || items.length > this.maxIngredients) {
      return null;
    }

    const ingredientKeys = items
      .map(item => Glyph[item.glyph].toLowerCase())
      .sort();
    const recipeKey = ingredientKeys.join(':');

    const resultData = this.recipes.get(recipeKey);

    this.removeItemsFromInventory(items);

    if (resultData) {
      const newItem = this.handleMatchingRecipe(resultData);
      // Return the new item or a junk item if there is an error during item creation.
      return newItem ?? this.createJunkItem();
    }

    // No matching recipe, return junk.
    return this.createJunkItem();
  }

  /**
   * Removes all items from the inventory that are in the given array.
   * @param items - The items to remove.
   */
  private removeItemsFromInventory(items: ItemObject[]) {
    for (const item of items) {
      const index = this.inventory.items.findIndex(i => i.id === item.id);
      if (index !== -1) {
        this.inventory.items.splice(index, 1);
      }
    }
  }

  /**
   * Creates a new ItemObject based on the given RecipeResult data.
   * @param resultData - The recipe result data.
   * @returns A new ItemObject if the recipe result data is valid, or null if it is invalid.
   * @throws If the recipe result data is invalid.
   */
  private handleMatchingRecipe(resultData: RecipeResult): ItemObject | null {
    const {
      glyph: glyphName,
      slot: slotName,
      category: categoryNames,
      spell: spellName,
      level,
      charges,
      effectMagnitude,
    } = resultData;

    const glyph = Glyph[glyphName as keyof typeof Glyph];
    if (glyph === undefined) {
      console.error(`Invalid glyph in recipe result: ${glyphName}`);
      return null;
    }

    const slot = Slot[slotName as keyof typeof Slot];
    if (slot === undefined) {
      console.error(`Invalid slot in recipe result: ${slotName}`);
      return null;
    }

    const categories = categoryNames.map(
      c => ObjCategory[c as keyof typeof ObjCategory],
    );
    if (categories.some(c => c === undefined)) {
      console.error(`Invalid category in recipe result: ${categoryNames}`);
      return null;
    }

    const spell = spellName
      ? Spell[spellName as keyof typeof Spell]
      : Spell.None;
    if (spell === undefined) {
      console.error(`Invalid spell in recipe result: ${spellName}`);
      return null;
    }

    const desc = GlyphMap.getGlyphDescription(glyph);

    return new ItemObject(
      glyph,
      slot,
      categories,
      spell,
      level,
      desc,
      charges,
      effectMagnitude,
    );
  }

  /**
   * Creates a new ItemObject with default "junk" properties.
   *
   * @returns A new ItemObject with default "junk" properties.
   */
  private createJunkItem(): ItemObject {
    const desc = GlyphMap.getGlyphDescription(Glyph.Junk);

    return new ItemObject(
      Glyph.Junk,
      Slot.NotWorn,
      [ObjCategory.Misc],
      Spell.None,
      0,
      desc,
      0,
      null,
    );
  }
}
