import { CAVE_LEVEL_TILES } from './generationData/caveLevelTiles';
import { GameMap } from '../mapModel/gameMap';
import { GameMapType } from '../../types/gameLogic/maps/mapModel/gameMapType';
import { Glyph } from '../../gameLogic/glyphs/glyph';
import { IrregularShapeAreaGenerator } from '../helpers/irregularShapeAreaGenerator';
import { MapUtils } from '../helpers/mapUtils';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { WeightedFeatureConfig } from '../../types/gameLogic/maps/helpers/weightedFeatures';
import { WorldPoint } from '../mapModel/worldPoint';

const caveFeatures: WeightedFeatureConfig[] = [
  {
    glyph: Glyph.Deep_Water,
    weight: 3,
    minSize: 15,
    maxSize: 40,
    iterations: 8,
  },
  {
    glyph: Glyph.Shallow_Water,
    weight: 5,
    minSize: 10,
    maxSize: 30,
    iterations: 6,
  },
  { glyph: Glyph.Lava, weight: 2, minSize: 8, maxSize: 25, iterations: 10 },
];

/**
 * GameMapType generator for cave-like environments using the Drunkard's Walk algorithm.
 */
export class MapGenerator_Cave {
  constructor(
    public map: GameMap,
    public rand: RandomGenerator,
  ) {}

  /**
   * Generates a cave map using the given random generator and level number.
   *
   * This function creates a new instance of the MapGenerator_Cave class and
   * calls its createCave method to generate the map.
   *
   * @param {RandomGenerator} rand - The random number generator.
   * @param {number} level - The level number of the map.
   * @return {GameMapType} The generated map.
   */
  public static generate(rand: RandomGenerator, level: number): GameMapType {
    const mapDimensionsX = 128;
    const mapDimensionsY = 64;
    const mapDimensions = new WorldPoint(mapDimensionsX, mapDimensionsY);
    const map = new GameMap(mapDimensions, Glyph.Rock, level);

    const generator = new MapGenerator_Cave(map, rand);
    return generator.createCave();
  }

  /**
   * Generates a cave-like map using the Drunkard's Walk algorithm and
   * adds various features and modifications.
   *
   * The function clears the current map, applies the Drunkard's Walk
   * algorithm to carve out paths, and then generates a number of features
   * based on defined weights. These features are irregularly shaped areas
   * such as water or lava.
   *
   * Terrain modifications are applied to create patches of mossy floors,
   * and chasms are added to the map. Finally, cell-specific modifications
   * are processed before returning the completed map.
   *
   * @return {GameMapType} The generated cave-like map.
   */
  public createCave(): GameMapType {
    MapUtils.clearMap(this.map);

    const wallProbability = 0.5;
    const maxIterations = 10000;

    MapUtils.drunkardsWalk(
      this.map,
      this.rand,
      CAVE_LEVEL_TILES,
      wallProbability,
      maxIterations,
    );

    const numberOfFeaturesToGenerate = 25;
    const mapDimensions = this.map.dimensions;

    MapUtils.generateRandomFeatures(
      numberOfFeaturesToGenerate,
      this.map,
      this.rand,
      caveFeatures,
      mapDimensions,
    );

    MapUtils.applyTerrainModifier(
      this.map,
      this.rand,
      mapDimensions,
      this.rand.randomIntegerClosedRange(40, 100),
      5,
      15,
      5,
      Glyph.Regular_Floor,
      Glyph.Mossy_Floor,
    );

    this.addChasm();

    MapUtils.applyStaticEffectsToCells(this.map);

    return this.map;
  }

  /**
   * Resets the map to all wall tiles, to be used before generation.
   */

  /**
   * Adds a random number of chasm areas to the map.
   *
   * The number of chasm areas is a random integer between 3 and 7.
   * Each chasm area is a random size between 15 and 40 squares.
   *
   * The chasm areas are added using the addChasmAreas method.
   */
  private addChasm(): void {
    const centerGlyph = Glyph.Chasm_Center;
    const edgeGlyph = Glyph.Chasm_Edge;
    const chasmCount = this.rand.randomIntegerClosedRange(3, 7);
    const chasmMinSize = 15;
    const chasmMaxSize = 40;
    this.addChasmAreas(
      this.rand,
      chasmCount,
      chasmMinSize,
      chasmMaxSize,
      centerGlyph,
      edgeGlyph,
    );
  }

  /**
   * Adds a specified number of chasm areas to the map.
   *
   * Each chasm area is a random size between areaMinSize and areaMaxSize.
   * The chasm areas are added using the createChasmAreas method.
   *
   * @param {RandomGenerator} rand - The random number generator.
   * @param {number} areaCount - The number of chasm areas to add.
   * @param {number} areaMinSize - The minimum size of a chasm area.
   * @param {number} areaMaxSize - The maximum size of a chasm area.
   * @param {Glyph} centerGlyph - The glyph representing the center of a chasm area.
   * @param {Glyph} edgeGlyph - The glyph representing the edge of a chasm area.
   */
  private addChasmAreas(
    rand: RandomGenerator,
    areaCount: number,
    areaMinSize: number,
    areaMaxSize: number,
    centerGlyph: Glyph,
    edgeGlyph: Glyph,
  ): void {
    for (let i = 0; i < areaCount; i++) {
      const size = rand.randomIntegerClosedRange(areaMinSize, areaMaxSize);
      this.createChasmAreas(rand, size, centerGlyph, edgeGlyph);
    }
  }

  /**
   * Creates a chasm area on the map.
   *
   * The chasm area is created by generating an irregular shape area using the
   * provided random generator, size, and number of iterations.
   * The cells in the generated area are set to the provided centerGlyph.
   * The cells around the edge of the area are set to the provided edgeGlyph.
   *
   * @param {RandomGenerator} rand - The random number generator.
   * @param {number} size - The size of the chasm area.
   * @param {Glyph} centerGlyph - The glyph representing the center of the chasm area.
   * @param {Glyph} edgeGlyph - The glyph representing the edge of the chasm area.
   */
  private createChasmAreas(
    rand: RandomGenerator,
    size: number,
    centerGlyph: Glyph,
    edgeGlyph: Glyph,
  ): void {
    const mapDimensions = this.map.dimensions;
    const chasmArea = IrregularShapeAreaGenerator.generateIrregularShapeArea(
      mapDimensions,
      rand,
      size,
      15,
    );

    for (const point of chasmArea) {
      if (this.map.isLegalPoint(point)) {
        this.map.cell(point).env = centerGlyph;
      }
    }

    const edgeCandidates = new Set<string>();
    for (const point of chasmArea) {
      if (!this.map.isLegalPoint(point)) continue;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;

          const neighbor = new WorldPoint(point.x + dx, point.y + dy);
          const neighborKey = `${neighbor.x},${neighbor.y}`;

          if (
            this.map.isLegalPoint(neighbor) &&
            !edgeCandidates.has(neighborKey)
          ) {
            if (this.map.cell(neighbor).env !== centerGlyph) {
              this.map.cell(neighbor).env = edgeGlyph;
            }
            edgeCandidates.add(neighborKey); // Mark as processed
          }
        }
      }
    }
  }
}
