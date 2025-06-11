import { Glyph } from '../../../../gameLogic/glyphs/glyph';
import { ItemObject } from '../../../../gameLogic/itemObjects/itemObject';
import { MapCell } from '../../../../maps/mapModel/mapCell';
import { Mob } from '../../../../gameLogic/mobs/mob';
import { TurnQueue } from '../../../../gameLogic/turnQueue/turnQueue';
import { WorldPoint } from '../../../../maps/mapModel/worldPoint';

export type GameMapType = {
  dimensions: WorldPoint;
  level: number;
  cells: MapCell[][];
  isDark: boolean;
  temperature: number;
  upStairPos?: WorldPoint;
  downStairPos?: WorldPoint;
  queue: TurnQueue;
  cell(p: WorldPoint): MapCell;
  isLegalPoint(p: WorldPoint): boolean;
  addNPC(m: Mob): Mob;
  enterMap(player: Mob, np: WorldPoint): void;
  addStairInfo(
    glyph: Glyph.Stairs_Up | Glyph.Stairs_Down,
    pos: WorldPoint,
  ): void;
  moveMob(m: Mob, p: WorldPoint): void;
  removeMob(m: Mob): void;
  mobToCorpse(m: Mob): void;
  isBlocked(p: WorldPoint): boolean;
  addObject(o: ItemObject, p: WorldPoint): void;
  forEachCell(action: (cell: MapCell, p: WorldPoint) => void): void;
  setEnvironmentDescriptions(): void;
  setLevelTemperature(surfaceTemp: number): void;
};
