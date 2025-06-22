import { Buff } from '../gameLogic/buffs/buffEnum';
import { CanSee } from '../maps/helpers/canSee';
import { DrawableTerminal } from '../types/terminal/drawableTerminal';
import { EnvEffect } from '../types/gameLogic/maps/mapModel/envEffect';
import { GameMapType } from '../types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../types/gameBuilder/gameState';
import { Glyph } from '../gameLogic/glyphs/glyph';
import { GlyphInfo } from '../gameLogic/glyphs/glyphInfo';
import { GlyphMap } from '../gameLogic/glyphs/glyphMap';
import { ManipulateColors } from '../colors/manipulateColors';
import { MapCell } from '../maps/mapModel/mapCell';
import { Spell } from '../gameLogic/spells/spell';
import { SpellColors } from '../colors/spellColors';
import { TerminalPoint } from '../terminal/terminalPoint';
import { WorldPoint } from '../maps/mapModel/worldPoint';

/**
 * Sets each cell in the terminal to the appropriate glyph, information and colors.
 */
export class MapRenderer {
  public static outside: MapCell = new MapCell(Glyph.Unknown);
  private static unlitColor: string = '#111a24';
  private static unlitColorSolidBg: string = '#222';
  private static farLitColor: string = '#485460';

  /**
   * Draws a cell on the terminal.
   *
   * @param term - The terminal used for drawing.
   * @param tp - The position on the terminal to draw at.
   * @param wp - The position of the cell on the map.
   * @param map - The map containing the cells.
   * @param playerPos - The position of the player on the map.
   * @param farDist - The maximum distance that a cell can be from the player to be visible.
   * @param blind - Whether the player is blind.
   * @param isRayCast - Whether ray casting is being used to render the map.
   */
  private static drawCell(
    term: DrawableTerminal,
    tp: TerminalPoint,
    wp: WorldPoint,
    map: GameMapType,
    playerPos: WorldPoint,
    farDist: number,
    blind: boolean,
    isRayCast: boolean,
  ): void {
    const cell = map.isLegalPoint(wp) ? map.cell(wp) : this.outside;
    const distanceSq = wp.squaredDistanceTo(playerPos);
    const actualDistance = Math.sqrt(distanceSq);
    const farThreshold = Math.sqrt(farDist);
    const dimOffset = 1;

    const isDim =
      actualDistance > farThreshold &&
      actualDistance <= farThreshold + dimOffset;

    const far = actualDistance > farThreshold + dimOffset && !blind;
    const isEntityVisible = this.checkEntityVisibility(
      cell,
      playerPos,
      map,
      far,
      blind,
    );

    const glyph = isEntityVisible
      ? cell.mob!.glyph
      : cell.glyphSpriteOrObjOrCorpseOrEnv();
    const glyphInfo = GlyphMap.getGlyphInfo(glyph);
    const envOnlyGlyphInfo = GlyphMap.getGlyphInfo(cell.env);

    const { fg, bg } = this.getCellColors(
      cell,
      glyphInfo,
      envOnlyGlyphInfo,
      far,
      blind,
      isRayCast,
      playerPos,
      wp,
      map,
      isDim,
    );

    term.drawAt(tp.x, tp.y, glyphInfo.char, fg, bg);
  }

  /**
   * Checks the visibility of an entity based on various conditions.
   *
   * @param cell - The cell to check visibility for.
   * @param playerPos - The position of the player on the map.
   * @param map - The current map.
   * @param far - Indicates if the entity is far from the player.
   * @param blind - Indicates if the player is blind.
   * @return Whether the entity is visible under the given conditions.
   */
  private static checkEntityVisibility(
    cell: MapCell,
    playerPos: WorldPoint,
    map: GameMapType,
    far: boolean,
    blind: boolean,
  ): boolean {
    return (
      !!cell.mob &&
      !far &&
      (!blind || cell.mob.isPlayer) &&
      CanSee.checkPointLOS_Bresenham(cell.mob.pos, playerPos, map, true)
    );
  }

  /**
   * Computes the foreground and background colors for a cell, taking into
   * account several factors such as distance from the player, whether the
   * player is blind, whether the cell is part of a raycast, and whether the
   * cell is in a foggy area.
   *
   * @param cell - the cell to compute the colors for.
   * @param glyphInfo - the GlyphInfo for the glyph on the cell.
   * @param envOnlyGlyphInfo - the GlyphInfo for the environment glyph.
   * @param far - whether the cell is far from the player.
   * @param blind - whether the player is blind.
   * @param isRayCast - whether the cell is part of a raycast.
   * @param playerPos - the position of the player.
   * @param wp - the position of the cell.
   * @param map - the current map.
   * @param isDim - whether the cell is dimmed.
   * @return The foreground and background colors.
   */
  private static getCellColors(
    cell: MapCell,
    glyphInfo: GlyphInfo,
    envOnlyGlyphInfo: GlyphInfo,
    far: boolean,
    blind: boolean,
    isRayCast: boolean,
    playerPos: WorldPoint,
    wp: WorldPoint,
    map: GameMapType,
    isDim: boolean,
  ): { fg: string; bg: string } {
    if (far || blind) {
      return {
        fg: this.getGeneralFgCol(cell, glyphInfo),
        bg: this.getGeneralBgCol(cell, glyphInfo),
      };
    }

    if (!cell.lit && !blind) cell.lit = true;

    let resultColors: { fg: string; bg: string };

    if (isRayCast) {
      const isVisible = CanSee.checkPointLOS_RayCast(playerPos, wp, map);
      resultColors = {
        fg: this.getRayCastFgCol(isVisible, cell, glyphInfo),
        bg: this.getRayCastBgCol(isVisible, cell),
      };
    } else {
      let fg = glyphInfo.fgCol;
      if (!cell.mob && cell.obj && cell.obj.spell !== Spell.None) {
        fg = SpellColors.c[cell.obj.spell][0];
      }
      resultColors = { fg, bg: envOnlyGlyphInfo.bgCol };
    }

    if (isDim) {
      resultColors.fg = glyphInfo.hasSolidBg
        ? this.farLitColor
        : ManipulateColors.darkenColor(resultColors.fg, 0.3);
      resultColors.bg = glyphInfo.hasSolidBg
        ? this.unlitColorSolidBg
        : this.unlitColor;
    }

    return resultColors;
  }

  /**
   * Helper function that Iterates over each cell in the view and invokes a callback function for each cell.
   *
   * @param term - The terminal used for drawing.
   * @param map - The map containing the cells.
   * @param vp - The view point on the map.
   * @param callback The callback function to be executed for each cell.
   */
  private static forEachCellInView(
    term: DrawableTerminal,
    map: GameMapType,
    vp: WorldPoint,
    callback: (
      tp: TerminalPoint,
      wp: WorldPoint,
      term: DrawableTerminal,
      map: GameMapType,
    ) => void,
  ): void {
    const terminalDimensions = term.dimensions;
    const tp = new TerminalPoint();
    const wp = new WorldPoint();
    const mapOffSet = 0;

    for (
      tp.y = mapOffSet, wp.y = vp.y;
      tp.y < terminalDimensions.y + mapOffSet;
      ++tp.y, ++wp.y
    ) {
      for (tp.x = 0, wp.x = vp.x; tp.x < terminalDimensions.x; ++tp.x, ++wp.x) {
        callback(tp, wp, term, map);
      }
    }
  }

  /**
   * Draws the map normally based on the player's position and game state.
   *
   * @param term - The terminal used for drawing.
   * @param map - The map to be drawn.
   * @param vp - The viewpoint on the map.
   * @param playerPos - The position of the player on the map.
   * @param game - The current game state.
   */
  public static drawMap_Standard(
    term: DrawableTerminal,
    map: GameMapType,
    vp: WorldPoint,
    playerPos: WorldPoint,
    game: GameState,
  ): void {
    const buffs = game.player.buffs;
    const blind = buffs && buffs.is(Buff.Blind);
    const farDist = CanSee.getFarDist(playerPos, map, game);

    this.forEachCellInView(term, map, vp, (tp, wp, term, map) => {
      this.drawCell(term, tp, wp, map, playerPos, farDist, blind, false);
    });
  }

  /**
   * Renders the map using ray casting technique.
   *
   * @param term - The terminal used for drawing.
   * @param map - The map containing the cells.
   * @param vp - The view point on the map.
   * @param playerPos - The position of the player on the map.
   * @param game - The game state object.
   */
  public static drawMap_RayCast(
    term: DrawableTerminal,
    map: GameMapType,
    vp: WorldPoint,
    playerPos: WorldPoint,
    game: GameState,
  ): void {
    const buffs = game.player.buffs;
    const blind = buffs && buffs.is(Buff.Blind);
    const farDist = CanSee.getFarDist(playerPos, map, game);

    this.forEachCellInView(term, map, vp, (tp, wp, term, map) => {
      this.drawCell(term, tp, wp, map, playerPos, farDist, blind, true);
    });
  }

  /**
   * Calculates the background color based on the solid background flag and cell lighting.
   *
   * @param cell - The map cell to determine background color for.
   * @param glyphInfo - Information about the glyph.
   * @return The background color for the cell.
   */
  private static getGeneralBgCol(cell: MapCell, glyphInfo: GlyphInfo): string {
    // If the glyph has a solid background and the cell is lit, return the solid background unlit color.
    if (glyphInfo.hasSolidBg && cell.lit) {
      return this.unlitColorSolidBg;
    }

    // Otherwise, return the default unlit color.
    return this.unlitColor;
  }

  /**
   * Calculates the foreground color of a cell based on its properties.
   *
   * @param cell - The cell to determine the color for.
   * @param glyphInfo - The information about the glyph.
   * @return The calculated foreground color.
   */
  private static getGeneralFgCol(cell: MapCell, glyphInfo: GlyphInfo): string {
    // If the cell is lit or if the player is on the cell and If the cell's environment is unknown, return the background color of the glyph
    if (cell.lit || cell.mob?.isPlayer) {
      if (cell.env === Glyph.Unknown) return glyphInfo.bgCol;

      // Otherwise, return the color used for far lit cells
      return this.farLitColor;
    }

    // If the cell is neither lit nor belongs to a player, return the unlit color.
    return this.unlitColor;
  }

  /**
   * Calculates the background color for a cell in ray casting mode.
   *
   * This method takes into account the visibility of the cell and applies the
   * appropriate darkness modifier. If the cell is bloody, it also tints the
   * background color with a red tone based on the blood intensity.
   *
   * @param isVisible - Flag indicating if the cell is visible.
   * @param cell - The cell to determine the color for.
   * @return The calculated background color.
   */
  private static getRayCastBgCol(isVisible: boolean, cell: MapCell): string {
    const envOnlyGlyphInfo = GlyphMap.getGlyphInfo(cell.env);
    let bgColor: string;

    if (isVisible) {
      bgColor = this.addEnvEffectsTint(
        envOnlyGlyphInfo.bgCol,
        cell.environment.effects,
      );
    } else {
      bgColor = ManipulateColors.darkenColor(envOnlyGlyphInfo.bgCol, 0.3);
    }

    if (cell.bloody && cell.bloody.isBloody) {
      const intensity = cell.bloody.intensity;
      const modifier_LOS = intensity * 0.2;
      const modifier_NO_LOS = intensity * 0.1;

      bgColor = isVisible
        ? this.addBloodiness(bgColor, modifier_LOS)
        : this.addBloodiness(bgColor, modifier_NO_LOS);
    }

    return bgColor;
  }

  /**
   * Calculates the foreground color of a cell for ray casting.
   *
   * @param isVisible - Flag indicating if the cell is visible.
   * @param cell - The cell to determine the color for.
   * @param glyphInfo - The information about the glyph.
   * @return The calculated foreground color.
   */
  private static getRayCastFgCol(
    isVisible: boolean,
    cell: MapCell,
    glyphInfo: GlyphInfo,
  ): string {
    // If the cell is visible
    if (isVisible) {
      const CORPSE_INTERACTING_GLYPHS = [
        Glyph.Visible_Trap,
        Glyph.Hidden_Trap,
        Glyph.Spiky_Crystal,
        Glyph.Lava,
      ];

      // If the cell is a potentially lethal env with a corpse return a darker version of the env color
      if (CORPSE_INTERACTING_GLYPHS.includes(cell.env) && cell.corpse) {
        const envColor = GlyphMap.getGlyphInfo(cell.env).fgCol;
        return ManipulateColors.darkenColor(envColor, 0.2);
      }
      // If the cell has an object with a spell, return the spell color
      /*   if (!cell.mob && cell.obj && cell.obj.spell !== Spell.None)
        return SpellColors.c[cell.obj.spell][0]; */

      // If the mob in the cell is bloody, tint the foreground color with a red tone
      if (cell.mob?.bloody.isBloody) {
        const intensity = cell.mob?.bloody.intensity;
        const modifier = intensity * 0.5;
        return this.addBloodiness(glyphInfo.fgCol, modifier);
      }

      // Otherwise, return the default foreground color
      return glyphInfo.fgCol;
      // If the cell is not visible
    } else {
      // If the cell is lit or if the player is on the cell and If the cell's environment is unknown, return the background color
      if (cell.lit || cell.mob?.isPlayer) {
        if (cell.env === Glyph.Unknown) return glyphInfo.bgCol;
        // Otherwise, darken the foreground color
        return ManipulateColors.darkenColor(glyphInfo.fgCol, 0.3);
      }

      // Return the unlit color if the cell is not visible and not lit
      return this.unlitColor;
    }
  }

  /**
   * Adds a tint to the given background color based on the specified environment effects.
   *
   * @param bgColor - The background color to tint.
   * @param envEffects - The environment effects to consider.
   * @return The tinted background color.
   */
  private static addEnvEffectsTint(
    bgColor: string,
    envEffects: EnvEffect[],
  ): string {
    if (envEffects.includes(EnvEffect.Confusion)) {
      return ManipulateColors.tintWithBlue(bgColor, 0.1);
    }
    if (envEffects.includes(EnvEffect.Poison)) {
      return ManipulateColors.tintWithPink(bgColor, 0.1);
    }
    return bgColor;
  }

  /**
   * Tints the given color with red to represent bloodiness based on the specified modifier.
   *
   * @param color - The original color to be tinted.
   * @param modifier - The intensity factor by which to tint the color with blood-red.
   * @return The color tinted with red to represent bloodiness.
   */

  private static addBloodiness(color: string, modifier: number): string {
    return ManipulateColors.tintWithBlood(color, modifier);
  }
}
