import { Terminal } from './terminal';
import { TerminalPoint } from './terminalPoint';

/**
 * Extends the functionality of the Terminal class to support resizing and dynamic canvas adjustments.
 */
export class ResizingTerminal extends Terminal {
  private canvas: HTMLCanvasElement;
  private canvasContainer: HTMLDivElement;

  constructor() {
    const defaultCanvas = <HTMLCanvasElement>(
      document.getElementById('terminal-canvas')
    );
    const defaultCtx = <CanvasRenderingContext2D>defaultCanvas.getContext('2d');
    super(TerminalPoint.TerminalDimensions, defaultCtx);

    this.canvas = defaultCanvas;
    this.canvasContainer = <HTMLDivElement>(
      document.getElementById('canvas-container')
    );

    window.addEventListener('resize', () =>
      requestAnimationFrame(() => this.handleResize()),
    );

    this.handleResize(); // Initialize the canvas size
  }

  /**
   * Reinitializes the canvas context by calling initializeContext() and setting the context to the return value.
   */
  public reinitializeContext(): void {
    this.ctx = this.initializeContext();
  }

  /**
   * Calculates the largest possible square cell size that fits within the given container dimensions
   * and updates the canvas size to match. The context is then reinitialized with the new canvas size.
   *
   * @param containerWidth - The width of the container in pixels.
   * @param containerHeight - The height of the container in pixels.
   */
  private resizeCanvasAndTerminal(
    containerWidth: number,
    containerHeight: number,
  ): void {
    // Determine the largest possible square cell size that fits within the container
    const maxWidthCells = Math.floor(containerWidth / this.dimensions.x);
    const maxHeightCells = Math.floor(containerHeight / this.dimensions.y);
    this.sideLength = Math.min(maxWidthCells, maxHeightCells);

    // Update canvas size to match the calculated side length
    this.canvas.width = this.sideLength * this.dimensions.x;
    this.canvas.height = this.sideLength * this.dimensions.y;

    // Center the canvas within the container
    const horizontalPadding = (containerWidth - this.canvas.width) * 0.5;
    const verticalPadding = (containerHeight - this.canvas.height) * 0.5;

    const left = horizontalPadding * 0.5;
    const right = horizontalPadding * 0.5;
    const top = verticalPadding * 0.5;
    const bottom = verticalPadding * 0.5;

    this.canvas.style.paddingLeft = `${left}px`;
    this.canvas.style.paddingRight = `${right}px`;
    this.canvas.style.paddingTop = `${top}px`;
    this.canvas.style.paddingBottom = `${bottom}px`;

    this.reinitializeContext();
  }

  /**
   * Handles the resize event by calculating the new canvas dimensions based on the container's current width and height, and adjusts the canvas and terminal size accordingly.
   */

  public handleResize(): void {
    const containerWidth = this.canvasContainer.offsetWidth;
    const containerHeight = this.canvasContainer.offsetHeight;
    this.resizeCanvasAndTerminal(containerWidth, containerHeight);
  }
}
