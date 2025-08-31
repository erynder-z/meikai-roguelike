import { DEFAULT_LEVEL_TILES } from './generationData/defaultLevelTiles';
import { GameMap } from '../mapModel/gameMap';
import { GameMapType } from '../../shared-types/gameLogic/maps/mapModel/gameMapType';
import { Glyph } from '../../gameLogic/glyphs/glyph';
import { MapUtils } from '../helpers/mapUtils';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { RockGenerator } from './rockGenerator';
import { WorldPoint } from '../mapModel/worldPoint';

/**
 * GameMapType generator for standard levels.
 */
export class MapGenerator1 {
  constructor(
    public gameMap: GameMapType,
    public rand: RandomGenerator,
  ) {}

  /**
   * Generates a map.
   *
   * @param m The map object to generate.
   * @param rand The random generator object.
   * @return The generated map.
   */
  private loop(m: GameMapType, rand: RandomGenerator): GameMapType {
    // Number of iterations for map generation
    const numIterations = 40;
    const upperLeft = new WorldPoint();
    const mapDimensions = m.dimensions;
    const roomDimensions = new WorldPoint();

    for (let n = 0; n < numIterations; ++n) {
      this.pickRandomPosition(upperLeft, roomDimensions);
      const filled = rand.isOneIn(3);
      this.drawRoom(upperLeft, roomDimensions, filled, rand);
    }

    MapUtils.applyTerrainModifier(
      m,
      rand,
      mapDimensions,
      rand.randomIntegerInclusive(50, 150),
      3,
      10,
      5,
      Glyph.Regular_Floor,
      Glyph.Mossy_Floor,
    );

    MapUtils.applyStaticEffectsToCells(m);
    return m;
  }

  /**
   * Picks a random position for a room.
   *
   * @param upperLeft The upper left corner of the room.
   * @param roomDimensions The dimensions of the room.
   */
  private pickRandomPosition(
    upperLeft: WorldPoint,
    roomDimensions: WorldPoint,
  ): void {
    const { rand } = this;

    const mapDimensions = this.gameMap.dimensions;

    roomDimensions.y = rand.randomIntegerInclusive(4, 16);
    roomDimensions.x = rand.randomIntegerInclusive(8, 24);

    if (rand.isOneIn(2)) {
      const swap = roomDimensions.x;
      roomDimensions.x = roomDimensions.y;
      roomDimensions.y = swap;
    }

    upperLeft.x = rand.randomIntegerExclusive(
      1,
      mapDimensions.x - roomDimensions.x - 1,
    );
    upperLeft.y = rand.randomIntegerExclusive(
      1,
      mapDimensions.y - roomDimensions.y - 1,
    );
  }

  /**
   * Draws a room on the map.
   *
   * @param upperLeft The upper left corner of the room.
   * @param dimensions The dimensions of the room.
   * @param filled Whether the room is filled.
   * @param rand The random generator object.
   */
  private drawRoom(
    upperLeft: WorldPoint,
    dimensions: WorldPoint,
    filled: boolean,
    rand: RandomGenerator,
  ): void {
    /* const centerGlyph = filled ? Glyph.Wall : Glyph.Regular_Floor; */
    const centerGlyph = filled
      ? RockGenerator.getWallRockTypes(rand, DEFAULT_LEVEL_TILES)
      : RockGenerator.getFloorRockTypes(rand, DEFAULT_LEVEL_TILES);
    const x2 = dimensions.x - 1;
    const y2 = dimensions.y - 1;
    const doorPositions: WorldPoint[] = [];
    const currentPoint = new WorldPoint();

    for (let y = 0; y <= dimensions.y; ++y) {
      currentPoint.y = y + upperLeft.y;
      for (let x = 0; x <= dimensions.x; ++x) {
        currentPoint.x = x + upperLeft.x;
        const isEdge =
          x === 0 || y === 0 || x === dimensions.x || y === dimensions.y;
        const isSecondLayer = x === 1 || y === 1 || x === x2 || y === y2;
        const glyph = isEdge
          ? RockGenerator.getFloorRockTypes(rand, DEFAULT_LEVEL_TILES)
          : isSecondLayer
            ? RockGenerator.getWallRockTypes(rand, DEFAULT_LEVEL_TILES)
            : centerGlyph;
        this.gameMap.cell(currentPoint).env = glyph;
        if (isSecondLayer) {
          doorPositions.push(currentPoint.copy());
        }
      }
    }
    if (!filled) this.placeDoors(doorPositions);
  }

  /**
   * Places doors on the map.
   *
   * @param doorPositions The positions for the doors.
   */
  private placeDoors(doorPositions: WorldPoint[]): void {
    const rand = this.rand;
    for (let i = rand.randomIntegerExclusive(1, 3); i >= 0; --i) {
      const index = rand.randomIntegerExclusive(0, doorPositions.length);
      const position = doorPositions[index];
      this.gameMap.cell(position).env = Glyph.Door_Closed;
    }
  }

  /**
   * Generates a map and returns it.
   *
   * @param dim - The dimensions of the map.
   * @param rand - The random generator object.
   * @param level - The level of the map.
   * @return The generated map.
   */
  public static generate(
    dim: WorldPoint,
    rand: RandomGenerator,
    level: number,
  ): GameMapType {
    const mapDimensionsX = dim.x;
    const mapDimensionsY = dim.y;
    const mapDimensions = new WorldPoint(mapDimensionsX, mapDimensionsY);
    const map = new GameMap(mapDimensions, Glyph.Rock, level);

    const generator = new MapGenerator1(map, rand);

    return generator.loop(map, rand);
  }
}
