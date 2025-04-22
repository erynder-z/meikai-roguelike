import {
  EnvEffect,
  randomEnvEffect,
} from '../../types/gameLogic/maps/mapModel/envEffect';
import { GameMapType } from '../../types/gameLogic/maps/mapModel/gameMapType';
import { Glyph } from '../glyphs/glyph';
import { MapCell } from '../../maps/mapModel/mapCell';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

export class EnvironmentChecker {
  private static areaOfEffectRadius: number = 1;

  /**
   * Checks if items can be dropped on the given cell.
   *
   * @param {MapCell} cell - The cell to check.
   * @return {boolean} Returns true if items can be dropped, false otherwise.
   */
  public static canItemsBeDropped(cell: MapCell): boolean {
    return !cell.hasObject() && cell.env === Glyph.Regular_Floor;
  }

  /**
   * Checks if a corpse can be dropped on the given cell.
   *
   * @param {MapCell} cell - The cell to check.
   * @return {boolean} Returns true if a corpse can be dropped, false otherwise.
   */
  public static canCorpseBeDropped(cell: MapCell): boolean {
    return !cell.corpse;
  }

  /**
   * Checks if a neighbor is within bounds of the map.
   *
   * @param {WorldPoint} neighbor - The neighboring point to check.
   * @param {GameMapType} map - The map containing the cells.
   * @return {boolean} Returns true if the neighbor is within bounds, false otherwise.
   */
  public static isValidNeighbor(
    neighbor: WorldPoint,
    map: GameMapType,
  ): boolean {
    return !neighbor.isPositionOutOfBounds(neighbor, map);
  }

  /**
   * Add all environmental effects to the given cell. These will be updated every time the screen is redrawn
   *
   * @param {MapCell} cell - The cell to add effects to.
   * @param {WorldPoint} wp - The position of the cell.
   * @param {GameMapType} map - The map containing the cells.
   * @return {void} This function does not return a value.
   */
  public static addDynamicCellEffects(
    cell: MapCell,
    wp: WorldPoint,
    map: GameMapType,
  ): void {
    this.addPoisonEffectToCellNeighbors(cell, wp, map);
    this.addConfusionEffectToCellNeighbors(cell, wp, map);
  }

  /**
   * Adds all static environmental effects to the given cell.
   * These shall only be used on map generation!
   *
   * @param {MapCell} cell - The cell to add effects to.
   * @return {void} This function does not return a value.
   */
  public static addStaticCellEffects(cell: MapCell): void {
    this.addArcaneSigilEffect(cell);
    this.addNebulousMistEffect(cell);
  }

  /**
   * Adds the poison effect to the cells surrounding the given cell, if it contains a Poison Mushroom glyph.
   *
   * @param {MapCell} cell - The cell to add the poison effect to.
   * @param {WorldPoint} wp - The position of the cell.
   * @param {GameMapType} map - The map containing the cells.
   * @return {void} This function does not return a value.
   */
  private static addPoisonEffectToCellNeighbors(
    cell: MapCell,
    wp: WorldPoint,
    map: GameMapType,
  ): void {
    if (cell.glyph() === Glyph.Poison_Mushroom) {
      const neighbors = wp.getNeighbors(this.areaOfEffectRadius);

      for (const neighbor of neighbors) {
        if (!this.isValidNeighbor(neighbor, map)) {
          continue;
        }

        const neighborCell = map.cell(neighbor);

        neighborCell.addEnvEffect(EnvEffect.Poison);
      }
    }
  }

  /**
   * Adds the confusion effect to the neighboring cells of the given cell if it contains a Confusion Mushroom glyph.
   *
   * @param {MapCell} cell - The cell to add the confusion effect to.
   * @param {WorldPoint} wp - The position of the cell.
   * @param {GameMapType} map - The map containing the cells.
   * @return {void} This function does not return a value.
   */
  private static addConfusionEffectToCellNeighbors(
    cell: MapCell,
    wp: WorldPoint,
    map: GameMapType,
  ): void {
    if (cell.glyph() === Glyph.Confusion_Mushroom) {
      const neighbors = wp.getNeighbors(this.areaOfEffectRadius);

      for (const neighbor of neighbors) {
        if (!this.isValidNeighbor(neighbor, map)) {
          continue;
        }

        const neighborCell = map.cell(neighbor);

        neighborCell.addEnvEffect(EnvEffect.Confusion);
      }
    }
  }

  /**
   * Adds a random arcane sigil effect to the given cell if it contains an Arcane Sigil glyph.
   *
   * @param {MapCell} cell - The cell to potentially add an arcane sigil effect to.
   * @return {void} This function does not return a value.
   */

  private static addArcaneSigilEffect(cell: MapCell): void {
    if (cell.glyph() === Glyph.Arcane_Sigil) {
      const effect = randomEnvEffect();
      cell.addEnvEffect(effect);
    }
  }

  /**
   * Adds the blindness effect to a cell if it contains a Nebulous Mist glyph.
   *
   * @param {MapCell} cell - The cell to potentially add the blindness effect to.
   * @return {void} This function does not return a value.
   */

  private static addNebulousMistEffect(cell: MapCell): void {
    if (cell.glyph() === Glyph.Nebulous_Mist)
      cell.addEnvEffect(EnvEffect.Blind);
  }

  /**
   * Gets the environmental effect corresponding to the given glyph.
   *
   * @param {Glyph} glyph - The glyph to get the effect from.
   * @return {EnvEffect | null} The environmental effect corresponding to the glyph, or null if not found.
   */
  private static getEffectFromGlyph(glyph: Glyph): EnvEffect | null {
    switch (glyph) {
      case Glyph.Poison_Mushroom:
        return EnvEffect.Poison;
      case Glyph.Confusion_Mushroom:
        return EnvEffect.Confusion;
      default:
        return null;
    }
  }

  /**
   * Clears the environmental effect in the area surrounding a specified cell.
   *
   * @param {WorldPoint} wp - The position of the cell.
   * @param {GameMapType} map - The map containing the cells.
   * @param {Glyph} glyph - The glyph representing the environmental effect.
   */
  public static clearCellEffectInArea(
    wp: WorldPoint,
    map: GameMapType,
    glyph: Glyph,
  ) {
    const effect = this.getEffectFromGlyph(glyph);

    if (effect != null) {
      const neighbors = wp.getNeighbors(this.areaOfEffectRadius);

      for (const neighbor of neighbors) {
        if (!this.isValidNeighbor(neighbor, map)) {
          continue;
        }

        const neighborCell = map.cell(neighbor);

        neighborCell.removeEnvEffect(effect);
      }
    }
  }
}
