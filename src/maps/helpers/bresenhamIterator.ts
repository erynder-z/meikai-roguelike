import { WorldPoint } from '../mapModel/worldPoint';

/**
 * Represents an iterator for generating points along a line using Bresenham's algorithm.
 */
export class BresenhamIterator {
  /**
   * Array to store generated points.
   */
  private pixels: WorldPoint[] = [];

  /**
   * Counter for iteration.
   */
  private i: number = 0;

  /**
   * Length of the longest side.
   */
  private longest: number = 0;

  /**
   * Length of the shortest side.
   */
  private shortest: number = 0;

  /**
   * Incremental change along the x-axis for the first step.
   */
  private dx1: number = 0;

  /**
   * Incremental change along the y-axis for the first step.
   */
  private dy1: number = 0;

  /**
   * Incremental change along the x-axis for the second step.
   */
  private dx2: number = 0;

  /**
   * Incremental change along the y-axis for the second step.
   */
  private dy2: number = 0;

  /**
   * Numerator used in Bresenham's algorithm.
   */
  private numerator: number = 0;

  /**
   * Current x-coordinate.
   */
  private x: number = 0;

  /**
   * Current y-coordinate.
   */
  private y: number = 0;

  /**
   * Checks if the iteration is complete.
   * @returns {boolean} - True if the iteration is complete, otherwise false.
   */
  public done(): boolean {
    return !(this.i <= this.longest);
  }

  /**
   * Iterates through all points along the line.
   */
  private iterateAllPoints(): void {
    for (this.i = 0; this.i <= this.longest; this.i++) {
      this.next();
    }
  }

  /**
   * Iterates through all points along the line.
   */
  private iterateAllPoints2(): void {
    let p: WorldPoint;

    do {
      p = this.next();
    } while (!this.done());

    console.log(p); // Logging the last point after iteration completion
  }

  /**
   * Creates a BresenhamIterator instance with specified start and end points.
   * @param start The starting point.
   * @param end The ending point.
   * @returns {BresenhamIterator} A BresenhamIterator instance.
   */
  public static createFromWorldPoint(
    start: WorldPoint,
    end: WorldPoint,
  ): BresenhamIterator {
    const iterator = new BresenhamIterator();
    iterator.init(start.x, start.y, end.x, end.y);
    return iterator;
  }

  /**
   * Initializes a BresenhamIterator instance with coordinates.
   * @param {number} x1 - The x-coordinate of the starting point.
   * @param {number} y1 - The y-coordinate of the starting point.
   * @param {number} x2 - The x-coordinate of the ending point.
   * @param {number} y2 - The y-coordinate of the ending point.
   * @returns {BresenhamIterator} - A BresenhamIterator instance.
   */
  public static createFromCoordinates(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): BresenhamIterator {
    return new BresenhamIterator().init(x1, y1, x2, y2);
  }

  /**
   * Initializes the iterator with coordinates.
   * @param {number} x1 - The x-coordinate of the starting point.
   * @param {number} y1 - The y-coordinate of the starting point.
   * @param {number} x2 - The x-coordinate of the ending point.
   * @param {number} y2 - The y-coordinate of the ending point.
   * @returns {BresenhamIterator} - The updated BresenhamIterator instance.
   */
  private init(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ): BresenhamIterator {
    this.x = x1;
    this.y = y1;
    const w: number = x2 - this.x;
    const h: number = y2 - this.y;
    this.dx1 = 0;
    this.dy1 = 0;
    this.dx2 = 0;
    this.dy2 = 0;
    if (w < 0) {
      this.dx1 = -1;
    } else if (w > 0) {
      this.dx1 = 1;
    }
    if (h < 0) {
      this.dy1 = -1;
    } else if (h > 0) {
      this.dy1 = 1;
    }
    if (w < 0) {
      this.dx2 = -1;
    } else if (w > 0) {
      this.dx2 = 1;
    }
    this.longest = Math.abs(w);
    this.shortest = Math.abs(h);
    if (!(this.longest > this.shortest)) {
      this.longest = Math.abs(h);
      this.shortest = Math.abs(w);
      if (h < 0) {
        this.dy2 = -1;
      } else if (h > 0) {
        this.dy2 = 1;
      }
      this.dx2 = 0;
    }
    this.numerator = Math.floor(this.longest * 0.5);
    this.i = 0;
    return this;
  }

  /**
   * Generates the next point in the iteration.
   * @returns {WorldPoint} - The next point in the iteration.
   */
  public next(): WorldPoint {
    const curPoint: WorldPoint = new WorldPoint(this.x, this.y);
    this.pixels.push(curPoint);
    this.numerator += this.shortest;
    if (!(this.numerator < this.longest)) {
      this.numerator -= this.longest;
      this.x += this.dx1;
      this.y += this.dy1;
    } else {
      this.x += this.dx2;
      this.y += this.dy2;
    }
    ++this.i;
    return curPoint;
  }
}
