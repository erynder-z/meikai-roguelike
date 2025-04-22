import { Corpse } from '../../gameLogic/mobs/corpse';
import { EnvironmentChecker } from '../../gameLogic/environment/environmentChecker';
import { FindFreeSpace } from '../helpers/findFreeSpace';
import { GameMapType } from '../../types/gameLogic/maps/mapModel/gameMapType';
import { Glyph } from '../../gameLogic/glyphs/glyph';
import { GlyphMap } from '../../gameLogic/glyphs/glyphMap';
import { ItemObject } from '../../gameLogic/itemObjects/itemObject';
import { ItemObjectManager } from '../../gameLogic/itemObjects/itemObjectManager';
import { MapCell } from './mapCell';
import { Mob } from '../../gameLogic/mobs/mob';
import { Spell } from '../../gameLogic/spells/spell';
import { TurnQueue } from '../../gameLogic/turnQueue/turnQueue';
import { WorldPoint } from './worldPoint';

/**
 * Represents the current game map.
 */
export class GameMap implements GameMapType {
  constructor(
    public dimensions: WorldPoint,
    public g_empty: Glyph,
    public level: number,
    public isDark: boolean = false,
    public cells: MapCell[][] = [],
    public upStairPos?: WorldPoint,
    public downStairPos?: WorldPoint,
    public queue: TurnQueue = new TurnQueue(),
  ) {
    this.cells = this.allocateMap(g_empty);
  }

  /**
   * Retrieves the map cell at the specified world point.
   * @param {WorldPoint} p - The world point to retrieve the cell for.
   * @returns {MapCell} The map cell at the specified world point.
   */
  public cell(p: WorldPoint): MapCell {
    if (!this.isLegalPoint(p)) return new MapCell(this.g_empty);
    return this.cells[p.y][p.x];
  }

  /**
   * Checks if the specified world point is legal on the game map.
   * @param {WorldPoint} p - The world point to check.
   * @returns {boolean} True if the point is legal, false otherwise.
   */
  public isLegalPoint(p: WorldPoint): boolean {
    return (
      p.x >= 0 && p.y >= 0 && p.x < this.dimensions.x && p.y < this.dimensions.y
    );
  }

  /**
   * Allocates and initializes the game map with empty cells.
   * @param {Glyph} g_empty - The default glyph for empty cells.
   * @returns {MapCell[][]} The 2D array of initialized map cells.
   */
  private allocateMap(g_empty: Glyph): MapCell[][] {
    const cells = new Array(this.dimensions.y);
    const p: WorldPoint = new WorldPoint();
    for (p.y = 0; p.y < this.dimensions.y; ++p.y) {
      cells[p.y] = new Array(this.dimensions.x);
      for (p.x = 0; p.x < this.dimensions.x; ++p.x) {
        cells[p.y][p.x] = new MapCell(g_empty);
      }
    }
    return cells;
  }

  /**
   * Adds information about the location of up and down stairs.
   *
   * @param {Glyph.Stairs_Up | Glyph.Stairs_Down} glyph - The type of stair glyph (up or down).
   * @param {WorldPoint} pos - The position of the stair on the map.
   * @returns {void}
   */
  public addStairInfo(
    glyph: Glyph.Stairs_Up | Glyph.Stairs_Down,
    pos: WorldPoint,
  ): void {
    if (glyph === Glyph.Stairs_Up) this.upStairPos = pos;
    if (glyph === Glyph.Stairs_Down) this.downStairPos = pos;
  }

  /**
   * Moves the given mob to the specified world point.
   *
   * @param {Mob} m - the mob to be moved
   * @param {WorldPoint} p - the destination world point
   * @return {void}
   */
  public moveMob(m: Mob, p: WorldPoint): void {
    this.cell(m.pos).mob = undefined;
    m.pos.x = p.x;
    m.pos.y = p.y;
    this.cell(m.pos).mob = m;
  }

  /**
   * Adds a new non-playable character to the map at the specified position and level.
   *
   * @param {Mob} m - the mob to be added
   * @returns {Mob} the newly added mob
   */
  public addNPC(m: Mob): Mob {
    const glyphInfo = GlyphMap.getGlyphInfo(m.glyph);

    if (glyphInfo === GlyphMap.bad)
      console.warn(`Using default glyph info for unknown glyph: ${m.glyph}`);

    m.name = glyphInfo.name;
    m.description = GlyphMap.getGlyphDescription(m.glyph);

    this.cell(m.pos).mob = m;
    this.queue.pushMob(m);
    return m;
  }

  /**
   * Remove a mob from the queue and set its position to undefined.
   *
   * @param {Mob} m - The mob to be removed.
   * @return {void}
   */
  public removeMob(m: Mob): void {
    this.queue.removeMob(m);
    this.cell(m.pos).mob = undefined;
  }

  /**
   * Remove a mob from the queue and the map, and replace it with a corpse item object.
   * If there is no free space in the same cell to drop the corpse, tries to find a free adjacent cell to drop it.
   * If no free space is found, the corpse is not created and a warning is logged.
   *
   * @param {Mob} mob - The mob to be removed and replaced with a corpse.
   * @return {void}
   */
  public mobToCorpse(mob: Mob): void {
    this.queue.removeMob(mob);

    const cell = this.cell(mob.pos);

    if (cell.mob === mob) {
      cell.mob = undefined;
    } else {
      console.error(
        `Mob ${mob.id} was not found in its expected cell ${mob.pos.toString()} during mobToCorpse.`,
      );
    }

    const corpseGlyph =
      Glyph[`${Glyph[mob.glyph]}_Corpse` as keyof typeof Glyph];
    if (!corpseGlyph) return;

    const canDropHere = EnvironmentChecker.canCorpseBeDropped(cell);
    if (canDropHere) {
      const corpse = new Corpse(corpseGlyph, mob.pos.x, mob.pos.y).create();
      cell.corpse = corpse;
      return;
    }

    const maxDropRadius = 3;
    const np = FindFreeSpace.findFreeAdjacent(mob.pos, this, maxDropRadius);
    if (np) {
      const corpse = new Corpse(corpseGlyph, np.x, np.y).create();
      const newCell = this.cell(np);

      if (!newCell.mob && !newCell.corpse) {
        newCell.corpse = corpse;
      } else {
        console.warn(
          `Found adjacent free space ${np.toString()} for corpse, but it was occupied.`,
        );
      }
      return;
    }
    console.log(
      `Mob ${mob.id} died at ${mob.pos.toString()}, but no space found to drop corpse.`,
    );
  }

  /**
   * Enters the player into the map at the specified world point.
   *
   * @param {Mob} player - the player to enter into the map
   * @param {WorldPoint} np - the world point where the player will enter
   * @return {void}
   */
  public enterMap(player: Mob, np: WorldPoint): void {
    player.pos.set(np);
    this.cell(player.pos).mob = player;
    this.queue.pushMob(player);
  }

  /**
   * A function that checks if a given WorldPoint is blocked.
   *
   * @param {WorldPoint} p - the WorldPoint to check
   * @return {boolean} true if the WorldPoint is blocked, false otherwise
   */
  public isBlocked(p: WorldPoint): boolean {
    if (!this.isLegalPoint(p)) {
      return true;
    }
    const c = this.cell(p);
    return c.isBlocked();
  }

  /**
   * Adds a new object to the game at the specified world point.
   *
   * @param {ItemObject} o - the object to be added
   * @param {WorldPoint} np - the world point where the player will enter
   * @return {void}
   */
  public addObject(o: ItemObject, p: WorldPoint): void {
    o.desc = GlyphMap.getGlyphDescription(o.glyph);
    if (o.spell != Spell.None)
      o.desc = ItemObjectManager.getSpellDescription(o.spell);

    this.cell(p).obj = o;
  }

  /**
   * Loops over every cell in the game map and performs the given action.
   * @param {Function} action - The action to perform on each cell.
   */
  public forEachCell(action: (cell: MapCell, p: WorldPoint) => void): void {
    const p: WorldPoint = new WorldPoint();
    for (p.y = 0; p.y < this.dimensions.y; ++p.y) {
      for (p.x = 0; p.x < this.dimensions.x; ++p.x) {
        action(this.cell(p), new WorldPoint(p.x, p.y));
      }
    }
  }

  /**
   * Sets the environment name, description and the default buff duration (if any) for every cell.
   */
  public setEnvironmentDescriptions(): void {
    this.forEachCell(cell => {
      const glyph = cell.glyphEnvOnly();
      cell.environment.glyph = glyph;
      cell.environment.name = GlyphMap.getGlyphInfo(glyph).name;
      cell.environment.description = GlyphMap.getGlyphDescription(glyph);
      cell.environment.defaultBuffDuration =
        GlyphMap.getEnvDefaultBuffDuration(glyph);
    });
  }
}
