import { EnvironmentChecker } from '../../gameLogic/environment/environmentChecker';
import { GameMap } from '../mapModel/gameMap';
import { GameMapType } from '../../types/gameLogic/maps/mapModel/gameMapType';
import { Glyph } from '../../gameLogic/glyphs/glyph';
import { IrregularShapeAreaGenerator } from './irregularShapeAreaGenerator';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { RockGenerator } from '../mapGenerator/rockGenerator';
import { Tile } from '../../types/gameLogic/maps/mapGenerator/tile';
import { WeightedFeatureConfig } from '../../types/gameLogic/maps/helpers/weightedFeatures';
import { WorldPoint } from '../mapModel/worldPoint';

/**
 * Utility class for map-related operations.
 */
export class MapUtils {
  /**
   * Resets a map to its default state of all rock tiles.
   * @param {GameMap} gameMap - The game map object containing cells and dimensions.
   */
  public static clearMap(gameMap: GameMap): void {
    for (let y = 0; y < gameMap.dimensions.y; y++) {
      for (let x = 0; x < gameMap.dimensions.x; x++) {
        const p = new WorldPoint(x, y);
        if (gameMap.isLegalPoint(p)) {
          gameMap.cell(p).env = Glyph.Rock;
        }
      }
    }
  }
  /**
   * Finds the nearest cell from a starting point that has the specified environment glyph.
   * Uses Breadth-First Search (BFS) to guarantee finding the closest match.
   *
   * @param startPoint - The WorldPoint from where the search begins.
   * @param gameMap - The game map object containing cells and dimensions.
   * @param targetGlyph - The Glyph enum value to search for in the cell's environment property.
   * @returns The WorldPoint coordinates of the nearest cell with the matching environment glyph,
   * or null if no such cell is found within the map boundaries.
   */
  public static findNearestCellWithGlyph(
    startPoint: WorldPoint,
    gameMap: GameMapType,
    targetGlyph: Glyph,
  ): WorldPoint | null {
    const queue: WorldPoint[] = [];
    const visited = new Set<string>();

    const isOutOfBounds = (p: WorldPoint): boolean => {
      return startPoint.isPositionOutOfBounds(p, gameMap);
    };

    // Check if start point is valid and add to queue
    if (!isOutOfBounds(startPoint)) {
      const startKey = `${startPoint.x},${startPoint.y}`;
      queue.push(startPoint);
      visited.add(startKey);
    } else {
      console.error('findNearestCellWithGlyph: Start point is out of bounds.');
      return null;
    }
    // Use index tracking for efficient queue dequeue simulation
    let head = 0;
    while (head < queue.length) {
      // Dequeue efficiently without using shift() which can be slow on large arrays
      const currentPoint = queue[head++];

      // Check the current cell
      const cell = gameMap.cell(currentPoint); // Assuming map.cell(point) exists

      // Check if the current cell's environment glyph matches the target
      if (cell && cell.environment.glyph === targetGlyph) {
        return currentPoint;
      }

      // Explore neighbors
      for (const neighborPoint of currentPoint.getNeighbors(1)) {
        const neighborKey = `${neighborPoint.x},${neighborPoint.y}`;

        // Check if the neighbor is within bounds and not visited
        if (!isOutOfBounds(neighborPoint) && !visited.has(neighborKey)) {
          visited.add(neighborKey);
          queue.push(neighborPoint);
        }
      }
    }

    // If the queue is exhausted and no match was found
    return null;
  }

  /**
   * Selects a weighted feature from a list of features based on their weights.
   *
   * @param {WeightedFeatureConfig[]} features - An array of features with associated weights.
   * @param {RandomGenerator} rand - The random generator used to pick a feature based on weight.
   * @return {WeightedFeatureConfig | null} The selected feature or null if the total weight is zero or less.
   */
  public static selectWeightedFeature(
    features: WeightedFeatureConfig[],
    rand: RandomGenerator,
  ): WeightedFeatureConfig | null {
    const totalWeight = features.reduce((sum, f) => sum + f.weight, 0);
    if (totalWeight <= 0) {
      return null;
    }

    let randomWeight = rand.randomIntegerClosedRange(1, totalWeight);

    for (const feature of features) {
      randomWeight -= feature.weight;
      if (randomWeight <= 0) {
        return feature;
      }
    }

    // If the loop completes and no feature was selected, return null
    return null;
  }

  /**
   * Modifies terrain in a game map by randomly applying a result glyph to target glyphs in irregularly shaped patches.
   *
   * @param {GameMapType} gameMap - The game map object to modify.
   * @param {RandomGenerator} rand - The random generator used to generate random numbers.
   * @param {WorldPoint} dim - The dimensions of the game map.
   * @param {number} attempts - The number of times to attempt to apply the result glyph.
   * @param {number} minPatchSize - The minimum size of an irregularly shaped patch of cells.
   * @param {number} maxPatchSize - The maximum size of an irregularly shaped patch of cells.
   * @param {number} iterations - The number of iterations to run the irregular shape generation algorithm.
   * @param {Glyph | Glyph[]} targetGlyphs - A single glyph or an array of glyphs that are targets for modification.
   * @param {Glyph} resultGlyph - The glyph to apply to the target glyphs.
   * @return {GameMapType} The modified game map.
   */
  public static applyTerrainModifier(
    gameMap: GameMapType,
    rand: RandomGenerator,
    dim: WorldPoint,
    attempts: number,
    minPatchSize: number,
    maxPatchSize: number,
    iterations: number,
    targetGlyphs: Glyph | Glyph[],
    resultGlyph: Glyph,
  ): GameMapType {
    const targets = Array.isArray(targetGlyphs) ? targetGlyphs : [targetGlyphs];
    if (targets.length === 0) return gameMap;

    for (let i = 0; i < attempts; i++) {
      const patchSize = rand.randomIntegerClosedRange(
        minPatchSize,
        maxPatchSize,
      );
      const patchArea = IrregularShapeAreaGenerator.generateIrregularShapeArea(
        dim,
        rand,
        patchSize,
        iterations,
      );

      for (const p of patchArea) {
        if (gameMap.isLegalPoint(p)) {
          const currentGlyph = gameMap.cell(p).env;

          if (targets.includes(currentGlyph)) {
            gameMap.cell(p).env = resultGlyph;
          }
        }
      }
    }
    return gameMap;
  }

  /**
   * Generates a specified number of features on a game map.
   *
   * Each feature is selected based on its weight, and its size is randomly determined
   * within the range specified in its configuration. The feature is then placed on the
   * map using the irregular shape area generator.
   *
   * @param {number} numFeatures - The number of features to generate.
   * @param {GameMapType} gameMap - The map where the features will be generated.
   * @param {RandomGenerator} rand - The random generator used to select features and determine sizes.
   * @param {WeightedFeatureConfig[]} featureConfigs - The configurations for the features.
   * @param {WorldPoint} dimensions - The dimensions of the map.
   * @return {GameMapType} The game map with the newly generated features.
   */
  public static generateRandomFeatures(
    numFeatures: number,
    gameMap: GameMapType,
    rand: RandomGenerator,
    featureConfigs: WeightedFeatureConfig[],
    dimensions: WorldPoint,
  ): GameMapType {
    for (let i = 0; i < numFeatures; i++) {
      const featureConfig = MapUtils.selectWeightedFeature(
        featureConfigs,
        rand,
      );

      if (featureConfig) {
        const featureSize = rand.randomIntegerClosedRange(
          featureConfig.minSize,
          featureConfig.maxSize,
        );

        const featureArea =
          IrregularShapeAreaGenerator.generateIrregularShapeArea(
            dimensions,
            rand,
            featureSize,
            featureConfig.iterations,
          );

        for (const point of featureArea)
          if (gameMap.isLegalPoint(point)) {
            gameMap.cell(point).env = featureConfig.glyph;
          }
      }
    }
    return gameMap;
  }

  /**
   * Generates a single feature on a game map using a given configuration.
   *
   * This function generates a single feature on the map by randomly sizing the feature
   * and generating an irregular shape. It then places the feature on the map if the
   * position is legal.
   *
   * @param {WeightedFeatureConfig} featureConfig - The configuration dictating feature weights and sizes.
   * @param {GameMapType} gameMap - The map where the feature will be generated.
   * @param {RandomGenerator} rand - The random number generator for randomness.
   * @param {WorldPoint} dimensions - The dimensions of the map.
   * @return {GameMapType} The game map with the newly generated feature.
   */
  public static generateSingleFeature(
    featureConfig: WeightedFeatureConfig,
    gameMap: GameMapType,
    rand: RandomGenerator,
    dimensions: WorldPoint,
  ): GameMapType {
    const featureSize = rand.randomIntegerClosedRange(
      featureConfig.minSize,
      featureConfig.maxSize,
    );

    const featureArea = IrregularShapeAreaGenerator.generateIrregularShapeArea(
      dimensions,
      rand,
      featureSize,
      featureConfig.iterations,
    );

    for (const point of featureArea)
      if (gameMap.isLegalPoint(point)) {
        gameMap.cell(point).env = featureConfig.glyph;
      }

    return gameMap;
  }

  /**
   * Performs a Drunkard's Walk algorithm on a game map to generate walls and caverns.
   *
   * This algorithm starts in the center of the map and randomly moves in any of the 4
   * cardinal directions. At each step, it checks if the point is within the map and
   * if it is a rock. If the point is a rock, it randomly decides whether to replace
   * the rock with a wall or a floor tile. This process is repeated many times.
   *
   * The algorithm also keeps track of the current position and resets it to the center
   * of the map if it goes out of bounds.
   *
   * @param {GameMap} gameMap - The game map to generate the caverns on.
   * @param {RandomGenerator} rand - The random number generator.
   * @param {Tile} mapTiles - The possible tiles to use for walls and floors.
   * @param {number} wallProbability - The probability that a rock will be replaced with a wall
   *   tile. Defaults to 0.5.
   * @param {number} maxIterations - The maximum number of steps to take in the walk.
   *   Defaults to 5000.
   * @return {GameMapType} The game map with the generated caverns.
   */
  public static drunkardsWalk(
    gameMap: GameMap,
    rand: RandomGenerator,
    mapTiles: Tile,
    wallProbability: number = 0.5,
    maxIterations: number = 5000,
  ): GameMapType {
    const mapDimensions = gameMap.dimensions;

    let x = Math.floor(mapDimensions.x / 2);
    let y = Math.floor(mapDimensions.y / 2);

    for (let i = 0; i < maxIterations; i++) {
      const currentPos = new WorldPoint(x, y);
      if (
        x > 1 &&
        y > 1 &&
        x < mapDimensions.x - 2 &&
        y < mapDimensions.y - 2
      ) {
        gameMap.cell(currentPos).env = RockGenerator.getFloorRockTypes(
          rand,
          mapTiles,
        );

        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const wallPos = new WorldPoint(x + dx, y + dy);

            if (
              gameMap.isLegalPoint(wallPos) &&
              gameMap.cell(wallPos).env === Glyph.Rock
            ) {
              if (rand.generateRandomNumber() < wallProbability) {
                gameMap.cell(wallPos).env = RockGenerator.getWallRockTypes(
                  rand,
                  mapTiles,
                );
              }
            }
          }
        }
      } else {
        x = Math.floor(mapDimensions.x / 2);
        y = Math.floor(mapDimensions.y / 2);
        continue;
      }

      /**
       * Generates a random direction.
       *
       * @return {number[]} a length 2 array containing the x and y delta
       *   values of the random direction. The possible values are:
       *   - [0, 1] (up)
       *   - [0, -1] (down)
       *   - [1, 0] (right)
       *   - [-1, 0] (left)
       */
      const randomDirection = (): number[] => {
        const directions = [
          [0, 1],
          [0, -1],
          [1, 0],
          [-1, 0],
        ];
        const index = rand.randomInteger(0, directions.length);
        return directions[index];
      };

      const direction = randomDirection();
      x += direction[0];
      y += direction[1];

      if (
        x <= 1 ||
        y <= 1 ||
        x >= mapDimensions.x - 2 ||
        y >= mapDimensions.y - 2
      ) {
        x = Math.floor(mapDimensions.x / 2);
        y = Math.floor(mapDimensions.y / 2);
      }
    }

    return gameMap;
  }

  /**
   * Applies static environment effects to each cell in the game map.
   *
   * This method iterates over every cell in the provided game map and checks
   * whether the cell's position is legal within the map boundaries. If the
   * position is legal, it applies static environment effects to the cell.
   *
   * @param {GameMap} gameMap - The game map object containing cells and dimensions.
   * @return {GameMapType} The game map with applied static environment effects to its cells.
   */
  public static applyStaticEffectsToCells(gameMap: GameMapType): GameMapType {
    for (let y = 0; y < gameMap.dimensions.y; y++) {
      for (let x = 0; x < gameMap.dimensions.x; x++) {
        const position = new WorldPoint(x, y);
        if (gameMap.isLegalPoint(position)) {
          EnvironmentChecker.addStaticCellEffects(gameMap.cell(position));
        }
      }
    }
    return gameMap;
  }
}
