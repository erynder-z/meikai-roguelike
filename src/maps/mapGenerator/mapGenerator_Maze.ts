import { GameMap } from '../mapModel/gameMap';
import { Glyph } from '../../gameLogic/glyphs/glyph';
import { MapUtils } from '../helpers/mapUtils';
import { MAZE_LEVEL_TILES } from './generationData/mazeLevelTiles';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { RockGenerator } from './rockGenerator';
import { WorldPoint } from '../mapModel/worldPoint';

/**
 * GameMapType generator for maze-like environments.
 */
export class MapGenerator_Maze {
  constructor(
    public map: GameMap,
    public rand: RandomGenerator,
  ) {}

  /**
   * Creates a maze map using the given random generator and level number.
   *
   * This function first clears the current map, carves out a maze using the
   * recursive backtracking algorithm, and then applies static effects to all
   * map cells.
   *
   * @return The generated maze map.
   */
  public createMaze(): GameMap {
    this.carveMaze();
    MapUtils.applyStaticEffectsToCells(this.map);
    return this.map;
  }

  /**
   * Recursively carves out a maze in the given map.
   *
   * The algorithm starts by initializing the entire map as walls.
   * Then, a random cell is chosen, and the algorithm carves out a passage
   * from there, randomly choosing a direction to move in.
   * It will only move to a cell if it is a wall, and will not move to a cell
   * that has already been visited.
   *
   * The algorithm will also randomly decide whether to add a door to each
   * cell it visits.
   */
  private carveMaze(): void {
    const { map, rand } = this;

    // Initialize the maze with walls
    for (let y = 0; y < map.dimensions.y; y++) {
      for (let x = 0; x < map.dimensions.x; x++) {
        map.cell(new WorldPoint(x, y)).env = RockGenerator.getWallRockTypes(
          rand,
          MAZE_LEVEL_TILES,
        );
      }
    }

    // Start carving the maze from a random cell
    const startX = rand.randomIntegerExclusive(1, map.dimensions.x - 2);
    const startY = rand.randomIntegerExclusive(1, map.dimensions.y - 2);
    const startCell = new WorldPoint(startX, startY);
    this.carvePassage(startCell);
  }

  /**
   * Recursively carves a passage from the given cell.
   *
   * It does this by randomly choosing a direction to move in, and
   * carving out a passage to the neighbor in that direction.
   * It will only move to a cell if it is a wall, and will not move
   * to a cell that has already been visited.
   *
   * The algorithm will also randomly decide whether to add a door
   * to each cell it visits.
   *
   * @param currentCell - The current cell to carve a passage from.
   */
  private carvePassage(currentCell: WorldPoint): void {
    const { map, rand } = this;

    const [x, y] = [currentCell.x, currentCell.y];
    map.cell(currentCell).env = Glyph.Regular_Floor;

    // Define possible directions
    const directions = this.shuffle([
      new WorldPoint(x + 2, y),
      new WorldPoint(x - 2, y),
      new WorldPoint(x, y + 2),
      new WorldPoint(x, y - 2),
    ]);

    for (const dir of directions) {
      const [nx, ny] = [dir.x, dir.y];
      // Check if the neighbor is within bounds and unvisited
      if (
        nx > 0 &&
        nx < map.dimensions.x - 1 &&
        ny > 0 &&
        ny < map.dimensions.y - 1 &&
        map.cell(dir).env ===
          RockGenerator.getWallRockTypes(rand, MAZE_LEVEL_TILES)
      ) {
        // Carve passage to the neighbor
        const midX = (x + nx) / 2;
        const midY = (y + ny) / 2;
        map.cell(new WorldPoint(midX, midY)).env =
          RockGenerator.getFloorRockTypes(rand, MAZE_LEVEL_TILES);

        // Randomly decide whether to add a door
        if (rand.isOneIn(25)) {
          map.cell(new WorldPoint(midX, midY)).env = Glyph.Door_Closed;
        }

        this.carvePassage(dir);
      }
    }
  }

  /**
   * Randomly shuffles the elements of the given array using the Fisher-Yates algorithm.
   *
   * @param array - The array of WorldPoints to shuffle.
   * @returns The shuffled array of WorldPoints.
   */

  private shuffle(array: WorldPoint[]): WorldPoint[] {
    const { rand } = this;
    for (let i = array.length - 1; i > 0; i--) {
      const j = rand.randomIntegerExclusive(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Generates a maze map using the given random generator and level number.
   *
   * This function creates a new instance of the MapGenerator_Maze class and
   * calls its generate method to generate the map.
   *
   * @param rand - The random number generator.
   * @param level - The level number of the map.
   * @return The generated map.
   */
  public static generate(rand: RandomGenerator, level: number): GameMap {
    const mapDimensionsX = 64;
    const mapDimensionsY = 32;
    const mapDimensions = new WorldPoint(mapDimensionsX, mapDimensionsY);
    const map = new GameMap(mapDimensions, Glyph.Obsidian, level);

    const generator = new MapGenerator_Maze(map, rand);

    return generator.createMaze();
  }
}
