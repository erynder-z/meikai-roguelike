import { Glyph } from '../../gameLogic/glyphs/glyph';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { GameMapType } from '../../shared-types/gameLogic/maps/mapModel/gameMapType';
import { GameMap } from '../mapModel/gameMap';
import { WorldPoint } from '../mapModel/worldPoint';

/**
 * Testing map generator.
 */
export class MapGenerator_Test {
  constructor(
    public map: GameMapType,
    public rand: RandomGenerator,
  ) {}

  public loop(map: GameMapType, rand: RandomGenerator): GameMapType {
    const numIterations = 40;
    const upperLeft = new WorldPoint();
    const roomDimensions = new WorldPoint();

    for (let n = 0; n < numIterations; ++n) {
      this.pickRandomPosition(upperLeft, roomDimensions);
      const filled = rand.isOneIn(3);
      this.drawRoom(upperLeft, roomDimensions, filled);
    }
    return map;
  }

  pickRandomPosition(upperLeft: WorldPoint, roomDimensions: WorldPoint): void {
    const rand = this.rand;
    const mapDimensions = this.map.dimensions;

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

  drawRoom(
    upperLeft: WorldPoint,
    dimensions: WorldPoint,
    filled: boolean,
  ): void {
    const centerGlyph = filled ? Glyph.Wall : Glyph.Regular_Floor;
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
          ? Glyph.Regular_Floor
          : isSecondLayer
            ? Glyph.Wall
            : centerGlyph;
        this.map.cell(currentPoint).env = glyph;
        if (isSecondLayer) {
          doorPositions.push(currentPoint.copy());
        }
      }
    }
    if (!filled) this.placeDoors(doorPositions);
  }

  placeDoors(doorPositions: WorldPoint[]): void {
    const rand = this.rand;
    for (let i = rand.randomIntegerExclusive(1, 3); i >= 0; --i) {
      const index = rand.randomIntegerExclusive(0, doorPositions.length);
      const position = doorPositions[index];
      this.map.cell(position).env = Glyph.Door_Closed;
    }
  }

  public static test(level: number): GameMapType {
    const mapDimensionsX = 96;
    const mapDimensionsY = 48;
    const mapDimensions = new WorldPoint(mapDimensionsX, mapDimensionsY);
    const map = new GameMap(mapDimensions, Glyph.Rock, level);

    const generateRandomInteger = () => {
      const min = 1;
      const max = 9999;
      return Math.floor(Math.random() * (max - min + 1) + min);
    };

    const randomSeed = generateRandomInteger();

    const rand = new RandomGenerator(randomSeed);
    const generator = new MapGenerator_Test(map, rand);

    return generator.loop(map, rand);
  }
}
