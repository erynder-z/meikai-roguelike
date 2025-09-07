import { EnvEffect } from '../../shared-types/gameLogic/maps/mapModel/envEffect';
import { GameMapType } from '../../shared-types/gameLogic/maps/mapModel/gameMapType';
import { Glyph } from '../glyphs/glyph';
import { MapCell } from '../../maps/mapModel/mapCell';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

export class EnvironmentChecker {
  private static areaOfEffectRadius: number = 1;

  private static readonly glyphToAuraEffectMap: Partial<
    Record<Glyph, EnvEffect>
  > = {
    [Glyph.Poison_Mushroom]: EnvEffect.Poison,
    [Glyph.Confusion_Mushroom]: EnvEffect.Confusion,
  };

  private static readonly staticGlyphEffectMap: Partial<
    Record<Glyph, () => EnvEffect>
  > = {
    [Glyph.Arcane_Sigil]: () => this.randomEnvEffect(),
    [Glyph.Nebulous_Mist]: () => EnvEffect.Blind,
  };

  /**
   * Checks if items can be dropped on the given cell.
   *
   * @param cell - The cell to check.
   * @return Returns true if items can be dropped, false otherwise.
   */
  public static canItemsBeDropped(cell: MapCell): boolean {
    return !cell.hasObject() && cell.env === Glyph.Regular_Floor;
  }

  /**
   * Checks if a corpse can be dropped on the given cell.
   *
   * @param cell - The cell to check.
   * @return Returns true if a corpse can be dropped, false otherwise.
   */
  public static canCorpseBeDropped(cell: MapCell): boolean {
    return !cell.corpse;
  }

  /**
   * Checks if a neighbor is within bounds of the map.
   *
   * @param neighbor - The neighboring point to check.
   * @param map - The map containing the cells.
   * @return Returns true if the neighbor is within bounds, false otherwise.
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
   * @param cell - The cell to add effects to.
   * @param wp - The position of the cell.
   * @param map - The map containing the cells.
   */
  public static addDynamicCellEffects(
    cell: MapCell,
    wp: WorldPoint,
    map: GameMapType,
  ): void {
    this.applyAuraEffect(
      cell,
      wp,
      map,
      Glyph.Poison_Mushroom,
      EnvEffect.Poison,
    );
    this.applyAuraEffect(
      cell,
      wp,
      map,
      Glyph.Confusion_Mushroom,
      EnvEffect.Confusion,
    );
  }

  /**
   * Adds all static environmental effects to the given cell.
   * These shall only be used on map generation!
   *
   * @param cell - The cell to add effects to.
   */
  public static addStaticCellEffects(cell: MapCell): void {
    const effectFactory = this.staticGlyphEffectMap[cell.glyph()];
    if (effectFactory) {
      cell.addEnvEffect(effectFactory());
    }
  }

  /**
   * Applies an aura effect to the given cell if it matches the given glyph,
   * and to all its neighbors within the given radius.
   *
   * @param cell - The cell to check for aura effect.
   * @param wp - The position of the cell.
   * @param map - The map containing the cells.
   * @param glyph - The glyph that triggers the aura effect.
   * @param effect - The aura effect to apply.
   */
  private static applyAuraEffect(
    cell: MapCell,
    wp: WorldPoint,
    map: GameMapType,
    glyph: Glyph,
    effect: EnvEffect,
  ): void {
    if (cell.glyph() === glyph) {
      const neighbors = wp.getNeighbors(this.areaOfEffectRadius);

      for (const neighbor of neighbors) {
        if (!this.isValidNeighbor(neighbor, map)) continue;

        const neighborCell = map.cell(neighbor);

        neighborCell.addEnvEffect(effect);
      }
    }
  }

  /**
   * Gets the environmental effect corresponding to the given glyph.
   *
   * @param glyph - The glyph to get the effect from.
   * @return The environmental effect corresponding to the glyph, or null if not found.
   */
  private static getEffectFromGlyph(glyph: Glyph): EnvEffect | null {
    return this.glyphToAuraEffectMap[glyph] ?? null;
  }

  /**
   * Clears the environmental effect in the area surrounding a specified cell.
   *
   * @param wp - The position of the cell.
   * @param map - The map containing the cells.
   * @param glyph - The glyph representing the environmental effect.
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

  /**
   * Returns a random environment effect. This will be one of the values
   * on the EnvEffect enum, excluding the numeric values.
   *
   * @return A random environment effect
   */
  private static randomEnvEffect = (): EnvEffect => {
    const effects = Object.keys(EnvEffect)
      .filter(key => isNaN(Number(key)))
      .map(key => EnvEffect[key as keyof typeof EnvEffect]);

    return effects[Math.floor(Math.random() * effects.length)];
  };
}
