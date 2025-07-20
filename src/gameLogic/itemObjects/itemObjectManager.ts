import { GameMapType } from '../../types/gameLogic/maps/mapModel/gameMapType';
import { Glyph } from '../glyphs/glyph';
import { ItemObject } from './itemObject';
import { ObjCategory } from './itemCategories';
import {
  ItemTemplate,
  ItemDefinitionJson,
} from '../../types/gameLogic/itemObjects/items';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { Slot } from './slot';
import { Spell } from '../spells/spell';
import spellData from '../../gameLogic/spells/spellData/spells.json';
import { WorldPoint } from '../../maps/mapModel/worldPoint';
import * as itemData from '../../gameLogic/itemObjects/itemData/items.json';

/**
 * Represents a collection of objects (items) in the game world.
 */
export class ItemObjectManager {
  private static objTypes: ItemTemplate[] = (
    itemData.items as ItemDefinitionJson[]
  ).map(item => ({
    glyph: Glyph[item.glyph as keyof typeof Glyph],
    slot: Slot[item.slot as keyof typeof Slot],
    category: item.category.map(
      (c: string) => ObjCategory[c as keyof typeof ObjCategory],
    ),
  }));

  private static highestSpellTier: number = Spell.None;

  /**
   * Retrieves the index of an object type based on its glyph.
   *
   * @param glyph - The glyph of the object type.
   * @return The index of the object type.
   */
  private static indexForGlyph(glyph: Glyph): number {
    return this.objTypes.findIndex(obj => obj.glyph == glyph);
  }

  /**
   * Adds an object of a specified type to the map at a given position.
   *
   * @param wp - The position to add the object.
   * @param map - The map to add the object to.
   * @param rand - The random generator to use for randomness.
   * @param objType - The glyph representing the object type.
   * @param level - The level of the object.
   * @return The added object.
   */
  private static addObjTypeToMap(
    wp: WorldPoint,
    map: GameMapType,
    rand: RandomGenerator,
    objType: Glyph,
    level: number,
  ): ItemObject {
    const index = this.indexForGlyph(objType);
    const template: ItemTemplate = ItemObjectManager.getTemplate(index);
    const object = this.makeTemplateObject(level, rand, template);
    map.addObject(object, wp);
    return object;
  }

  /**
   * Adds a random object of a specified level to the map at a given position.
   *
   * @param wp - The position to add the object.
   * @param map - The map to add the object to.
   * @param rand - The random generator to use for randomness.
   * @param level - The level of the object.
   * @return The added object.
   */
  static addRandomObjectForLevel(
    wp: WorldPoint,
    map: GameMapType,
    rand: RandomGenerator,
    level: number,
  ): ItemObject {
    const object = this.randomLevelObject(level, rand);
    map.addObject(object, wp);
    return object;
  }

  /**
   * Generates a random object of a specified level.
   *
   * @param level - The level of the object.
   * @param rand - The random generator to use for randomness.
   * @return The generated object.
   */
  public static randomLevelObject(
    level: number,
    rand: RandomGenerator,
  ): ItemObject {
    return this.rareRunes(rand, level);
  }

  /**
   * Returns a random object template from the objTypes array.
   *
   * @param rand - The random number generator used to generate a random index.
   * @return The randomly selected object template.
   */
  private static getRandomTemplate(rand: RandomGenerator): ItemTemplate {
    const index = rand.randomIntegerExclusive(
      ItemObjectManager.objTypes.length,
    );
    const template: ItemTemplate = ItemObjectManager.getTemplate(index);
    return template;
  }

  /**
   * Generates a rare rune item object with a specified level.
   *
   * @param rand - The random number generator used for randomness.
   * @param level - The level of the item object.
   * @return The generated rare rune item object.
   */
  private static rareRunes(rand: RandomGenerator, level: number): ItemObject {
    const maxAttempts = 1000;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const template = this.getRandomTemplate(rand);

      if (template.glyph == Glyph.Rune) {
        if (!rand.determineSuccess(level * 3)) {
          attempts++;
          continue;
        }
      }

      return this.makeTemplateObject(level, rand, template);
    }

    throw new Error('Exceeded maximum attempts to find a suitable template.');
  }

  /**
   * Creates an object based on a template.
   *
   * @param level - The level of the object.
   * @param rand - The random generator to use for randomness.
   * @param template - The template for the object.
   * @return The created object.
   */
  private static makeTemplateObject(
    level: number,
    rand: RandomGenerator,
    template: ItemTemplate,
  ): ItemObject {
    const objectLevel = rand.adjustLevel(level);
    const object = new ItemObject(
      template.glyph,
      template.slot,
      template.category,
    );
    object.level = objectLevel;

    switch (object.glyph) {
      case Glyph.Laudanum:
        this.setSpecificSpell(object, Spell.Heal);
        break;
      case Glyph.Rune:
        this.setItemSpell(object, rand);
        this.setCharges(object, 1, rand, level);
        break;
      case Glyph.Scroll:
        this.setItemSpell(object, rand);
        break;
      case Glyph.Revolver:
        this.setSpecificSpell(object, Spell.Bullet);
        object.charges = rand.randomIntegerExclusive(10, level);
        break;
      case Glyph.Ration:
        this.setItemSpell(object, rand);
        this.setCharges(object, 1, rand, level);
        break;
      case Glyph.Water_Bottle:
        this.setItemSpell(object, rand);
        this.setCharges(object, 1, rand, level);
        break;
    }

    return object;
  }

  /**
   * Sets the spell property of the given ItemObject based on its level using the random generator.
   *
   * @param object - The ItemObject to set the spell property for.
   * @param rand - The random number generator used to determine the spell.
   */
  private static setItemSpell(object: ItemObject, rand: RandomGenerator): void {
    const l = rand.adjustLevel(object.level);
    object.spell = this.spellForLevel(l);
  }

  /**
   * Returns a Spell based on the given level. Only spells matching the dungeon level or lower will be returned.
   *
   * @param level - The level to determine the Spell.
   * @return The Spell corresponding to the given level.
   */
  private static spellForLevel(level: number): Spell {
    const slot: Spell = level % this.highestSpellTier;
    return slot;
  }

  /**
   * Sets the specific spell for the given ItemObject.
   *
   * @param object - The ItemObject to set the spell for.
   * @param spell - The specific spell to set.
   */
  private static setSpecificSpell(object: ItemObject, spell: Spell): void {
    object.spell = spell;
  }

  /**
   * Sets the charges of an ItemObject using a random integer within a specified range.
   *
   * @param object - The ItemObject to set the charges for.
   * @param charges - The maximum number of charges.
   * @param rand - The random number generator used to generate a random integer.
   * @param level - The level used to adjust the maximum number of charges.
   */
  static setCharges(
    object: ItemObject,
    charges: number,
    rand: RandomGenerator,
    level: number,
  ): void {
    object.charges = rand.randomIntegerExclusive(charges, level);
  }
  /**
   * Retrieves a template object type based on its index.
   *
   * @param index - The index of the template.
   * @return The template object type.
   * @throws Throws an error if the index is out of bounds.
   */
  private static getTemplate(index: number): ItemTemplate {
    const length = ItemObjectManager.objTypes.length;

    if (index < 0 || index >= length) {
      throw `index ${index} is out of bounds`;
    }
    return ItemObjectManager.objTypes[index];
  }

  /**
   * Retrieves the description of a spell based on its category.
   *
   * @param spell - The spell to retrieve the description for.
   * @return The description of the spell, or 'no description' if not found.
   */
  public static getSpellDescription(spell: Spell): string {
    let description: string = 'no description';

    const spellInfo = spellData.spells.find(slot => slot.name === Spell[spell]);
    description = spellInfo?.desc || description;

    return description;
  }
}
