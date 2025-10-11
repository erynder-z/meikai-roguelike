import { WorldPoint } from '../../maps/mapModel/worldPoint';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';

export class IrregularShapeAreaGenerator {
  /**
   * Generates an irregular shape area using cellular automata.
   *
   * @param dim - The dimensions of the area.
   * @param rand - The random number generator.
   * @param maxSize - The maximum size of the shape.
   * @param iter - The number of iterations.
   * @return The set of points representing the irregular shape area.
   */
  public static generateIrregularShapeArea(
    dim: WorldPoint,
    rand: RandomGenerator,
    maxSize: number,
    iter: number,
  ): Set<WorldPoint> {
    const shape = new Set<WorldPoint>();
    // Initialize the shape with a random starting point
    const start = new WorldPoint(
      rand.randomIntegerExclusive(dim.x),
      rand.randomIntegerExclusive(dim.y),
    );
    shape.add(start);

    // Use cellular automata to grow the shape
    const iterations = iter;
    const maxShapeSize = maxSize;
    const offset = 2;

    for (let i = 0; i < iterations && shape.size < maxShapeSize; i++) {
      const newShape = new Set<WorldPoint>(shape);
      for (const p of shape) {
        const range = 1;
        const neighbors = p.getNeighbors(range);
        for (const neighbor of neighbors) {
          // Add neighboring points with a certain probability and if they're within the map bounds
          if (
            rand.isOneIn(3) &&
            neighbor.x >= offset &&
            neighbor.x < dim.x &&
            neighbor.y >= offset &&
            neighbor.y < dim.y
          ) {
            newShape.add(neighbor);
          }
        }
      }
      shape.clear();
      for (const p of newShape) {
        shape.add(p);
      }
    }

    return shape;
  }
}
