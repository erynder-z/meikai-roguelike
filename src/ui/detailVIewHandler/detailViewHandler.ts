import { Corpse } from '../../gameLogic/mobs/corpse';
import { EntityInfoCard } from '../entityInfoDisplay/entityInfoCard';
import { Glyph } from '../../gameLogic/glyphs/glyph';
import { ItemObject } from '../../gameLogic/itemObjects/itemObject';
import { DetailViewEntity } from '../../types/ui/detailViewEntity';
import { MapCell } from '../../maps/mapModel/mapCell';
import { Mob } from '../../gameLogic/mobs/mob';

export class DetailViewHandler {
  /**
   * Converts a given entity (Mob, Corpse, ItemObject, or MapCell's environment)
   * into a DetailViewEntity object that can be used to display information about the entity.
   *
   * If the given entity is not recognized, it will return an object with type 'unknown',
   * glyph Glyph.Unknown, and name and description of 'Unknown entity'.
   *
   * @param entity - The entity to convert into a DetailViewEntity.
   * @return The converted DetailViewEntity.
   */
  public transformIntoDetailViewEntity(
    entity: Mob | Corpse | ItemObject | MapCell['environment'],
  ): Omit<DetailViewEntity, 'uniqueKey'> {
    const baseEntity: Omit<DetailViewEntity, 'uniqueKey'> = {
      type: 'unknown',
      glyph: Glyph.Unknown,
      name: 'Unknown entity',
      description: 'Unknown entity',
    };

    if (entity instanceof Corpse) {
      return {
        ...baseEntity,
        type: 'corpse',
        glyph: entity.glyph,
        name: entity.name,
        description: entity.description,
      };
    } else if (entity instanceof Mob) {
      return {
        ...baseEntity,
        type: 'mob',
        glyph: entity.glyph,
        name: entity.name,
        description: entity.description,
        level: entity.level,
        hp: entity.hp,
        maxHp: entity.maxhp,
      };
    } else if (entity instanceof ItemObject) {
      return {
        ...baseEntity,
        type: 'item',
        glyph: entity.glyph,
        name: entity.name(),
        description: entity.description(),
        level: entity.level,
        charges: entity.charges,
        spell: entity.spell,
      };
    } else if (
      'name' in entity &&
      'description' in entity &&
      'effects' in entity
    ) {
      return {
        ...baseEntity,
        type: 'env',
        glyph: entity.glyph,
        name: entity.name,
        description: entity.description,
        envEffects: entity.effects,
      };
    }

    return baseEntity;
  }

  /**
   * Checks if the entity info card is currently open in the DOM.
   *
   * @return True if the entity info card is present, false otherwise.
   */
  public isEntityCardOpen(): boolean {
    const entityCardElement = document.getElementById(
      'entity-info-card',
    ) as EntityInfoCard;
    return entityCardElement !== null;
  }

  /**
   * Closes the currently open entity info card by removing it from the DOM.
   *
   * If there is no entity info card currently open, this function does nothing.
   */
  public closeOpenEntityCard(): void {
    const entityCardElement = document.getElementById(
      'entity-info-card',
    ) as EntityInfoCard;
    if (entityCardElement) entityCardElement.fadeOut();
  }
}
