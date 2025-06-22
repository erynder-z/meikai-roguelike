import * as colorData from '../colors/colors.json';
import { DrawableTerminal } from '../types/terminal/drawableTerminal';
import { gameConfigManager } from '../gameConfigManager/gameConfigManager';
import { ManipulateColors } from '../colors/manipulateColors';
import { TerminalPoint } from './terminalPoint';

const SLASH_DIRECTIONS = [
  'diagonalTLBR',
  'diagonalTRBL',
  'horizontal',
  'vertical',
];
const LONG_MIN_FACTOR = 0.75;
const LONG_MAX_FACTOR = 1.15;
const LONG_FACTOR_RANGE = LONG_MAX_FACTOR - LONG_MIN_FACTOR;
const SHORT_MIN_FACTOR = 0.55;
const SHORT_MAX_FACTOR = 1.0;
const SHORT_FACTOR_RANGE = SHORT_MAX_FACTOR - SHORT_MIN_FACTOR;

/**
 * Represents a terminal for drawing text on a canvas.
 */
export class Terminal implements DrawableTerminal {
  private gameConfig = gameConfigManager.getConfig();
  constructor(
    public dimensions: TerminalPoint,
    public ctx: CanvasRenderingContext2D,
    public horizontalSide: number = 1,
    public verticalSide: number = 1,
    public sideLength: number = 40,
  ) {
    // (Re)initialize the context with the desired settings.
    this.ctx = this.initializeContext();
  }

  /**
   * Initializes and configures the canvas rendering context.
   * Sets canvas dimensions, styles, and translation to ensure proper
   * text alignment and rendering. Adjusts font size based on the scaling factor.
   *
   * @return The initialized and configured rendering context.
   */
  public initializeContext(): CanvasRenderingContext2D {
    const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
    if (!canvas) throw new Error('Canvas with id "canvas1" not found.');

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Unable to get 2D context from canvas.');

    // Set canvas dimensions based on the terminal grid and side length.
    canvas.width = this.dimensions.x * this.sideLength;
    canvas.height = this.dimensions.y * this.sideLength;

    // Update horizontal and vertical cell dimensions.
    this.horizontalSide = this.sideLength;
    this.verticalSide = this.sideLength;

    // Calculate the font size based on the side length and scaling factor.
    const squeeze: number =
      this.sideLength * this.gameConfig.terminal.scaling_factor;

    // Configure canvas styles.
    ctx.fillStyle = colorData.root['--backgroundDefault'];
    ctx.strokeStyle = colorData.root['--backgroundDefault'];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${squeeze}px "${this.gameConfig.terminal.font}", monospace`;

    // Center the drawing context in the canvas.
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    return ctx;
  }

  /**
   * Updates the font size and family of the canvas rendering context.
   * The font size is calculated based on the terminal cell side length and a scaling factor,
   * and the font family is retrieved from the game configuration.
   */

  public updateFont(): void {
    this.ctx.font = `${this.sideLength * this.gameConfig.terminal.scaling_factor}px "${this.gameConfig.terminal.font}", monospace`;
  }

  /**
   * Creates a stock terminal object with the default canvas and context.
   *
   * @return The created terminal object.
   */
  public static createStockTerminal(): Terminal {
    const defaultCanvas = document.getElementById(
      'canvas1',
    ) as HTMLCanvasElement;
    if (!defaultCanvas) throw new Error('Canvas with id "canvas1" not found.');

    const defaultCtx = defaultCanvas.getContext('2d');
    if (!defaultCtx) throw new Error('Unable to get 2D context from canvas.');

    return new Terminal(TerminalPoint.TerminalDimensions, defaultCtx);
  }

  /**
   * Draws a string of text on the terminal at the given coordinates.
   *
   * @param x - The x-coordinate of the starting position.
   * @param y - The y-coordinate of the starting position.
   * @param text - The string of text to draw.
   * @param foreground - The foreground color.
   * @param background - The background color.
   */
  public drawText(
    x: number,
    y: number,
    text: string,
    foreground: string,
    background: string,
  ): void {
    for (let i = 0; i < text.length; ++i) {
      this.drawAt(x, y, text.charAt(i), foreground, background);
      ++x;
      if (x >= this.dimensions.x) {
        x = 0;
        ++y;
        if (y >= this.dimensions.y) {
          y = 0;
        }
      }
    }
  }

  /**
   * Draws a single character on the terminal at the specified coordinates.
   *
   * Calculates the pixel position for the character within the grid cell and centers it.
   * The background is drawn first, then a clipping rectangle is applied to keep the character
   * inside its cell.
   *
   * @param x - The x-coordinate of the cell position.
   * @param y - The y-coordinate of the cell position.
   * @param char - The character to draw.
   * @param foreground - The color of the character.
   * @param background - The background color of the cell.
   */
  public drawAt(
    x: number,
    y: number,
    char: string,
    foreground: string,
    background: string,
  ): void {
    const fx = x * this.horizontalSide;
    const fy = y * this.verticalSide;
    const px = (x + 0.5) * this.horizontalSide;
    const py = (y + 0.5) * this.verticalSide;

    this.ctx.save();
    {
      // Draw the cell background.
      this.ctx.fillStyle = background;
      this.ctx.fillRect(fx, fy, this.horizontalSide, this.verticalSide);

      // Clip drawing to the cell.
      this.ctx.beginPath();
      this.ctx.rect(fx, fy, this.horizontalSide, this.verticalSide);
      this.ctx.clip();

      // Draw the character.
      this.ctx.fillStyle = foreground;
      this.ctx.fillText(char, px, py);
    }
    this.ctx.restore();
  }

  /**
   * Draws an overlay cursor on the terminal at the specified coordinates.
   *
   * The cursor consists of a colored overlay and border drawn at the corners.
   *
   * @param x - The x-coordinate of the cell.
   * @param y - The y-coordinate of the cell.
   * @param color - The overlay color.
   * @param opacityFactor - The opacity factor for the overlay.
   * @param borderColor - The border color.
   * @param borderThickness - The thickness of the border.
   * @param cornerSize - The size of each border corner.
   */
  public drawOverlayCursor(
    x: number,
    y: number,
    color: string,
    opacityFactor: number,
    borderColor: string,
    borderThickness: number,
    cornerSize: number,
  ): void {
    const fx = x * this.horizontalSide;
    const fy = y * this.verticalSide;
    const rgbaColor = ManipulateColors.hexToRgba(color, opacityFactor);

    this.ctx.save();
    {
      // Draw the overlay.
      this.ctx.fillStyle = rgbaColor;
      this.ctx.fillRect(fx, fy, this.horizontalSide, this.verticalSide);

      // Configure the border.
      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = borderThickness;

      // Draw top-left corner.
      this.ctx.beginPath();
      this.ctx.moveTo(fx, fy);
      this.ctx.lineTo(fx + cornerSize, fy);
      this.ctx.moveTo(fx, fy);
      this.ctx.lineTo(fx, fy + cornerSize);
      this.ctx.stroke();

      // Draw top-right corner.
      this.ctx.beginPath();
      this.ctx.moveTo(fx + this.horizontalSide, fy);
      this.ctx.lineTo(fx + this.horizontalSide - cornerSize, fy);
      this.ctx.moveTo(fx + this.horizontalSide, fy);
      this.ctx.lineTo(fx + this.horizontalSide, fy + cornerSize);
      this.ctx.stroke();

      // Draw bottom-left corner.
      this.ctx.beginPath();
      this.ctx.moveTo(fx, fy + this.verticalSide);
      this.ctx.lineTo(fx + cornerSize, fy + this.verticalSide);
      this.ctx.moveTo(fx, fy + this.verticalSide);
      this.ctx.lineTo(fx, fy + this.verticalSide - cornerSize);
      this.ctx.stroke();

      // Draw bottom-right corner.
      this.ctx.beginPath();
      this.ctx.moveTo(fx + this.horizontalSide, fy + this.verticalSide);
      this.ctx.lineTo(
        fx + this.horizontalSide - cornerSize,
        fy + this.verticalSide,
      );
      this.ctx.moveTo(fx + this.horizontalSide, fy + this.verticalSide);
      this.ctx.lineTo(
        fx + this.horizontalSide,
        fy + this.verticalSide - cornerSize,
      );
      this.ctx.stroke();
    }
    this.ctx.restore();
  }

  /**
   * Draws a burst attack effect on the terminal at the specified coordinates.
   *
   * Radiates lines from the center of the cell at 45° intervals.
   *
   * @param x - The x-coordinate of the cell.
   * @param y - The y-coordinate of the cell.
   * @param color - The color of the burst lines.
   * @param opacityFactor - The opacity factor for the lines.
   * @param thickness - The thickness of the lines.
   */
  public drawBurstAttackOverlay(
    x: number,
    y: number,
    color: string,
    opacityFactor: number,
    thickness: number,
  ): void {
    const fx = x * this.horizontalSide + this.horizontalSide * 0.5;
    const fy = y * this.verticalSide + this.verticalSide * 0.5;

    this.ctx.strokeStyle = ManipulateColors.hexToRgba(color, opacityFactor);
    this.ctx.lineWidth = thickness;
    this.ctx.beginPath();

    for (let angle = 0; angle < 360; angle += 45) {
      const rad = (angle * Math.PI) / 180;
      const x2 = fx + Math.cos(rad) * this.horizontalSide * 0.4;
      const y2 = fy + Math.sin(rad) * this.verticalSide * 0.4;
      this.ctx.moveTo(fx, fy);
      this.ctx.lineTo(x2, y2);
    }
    this.ctx.stroke();
  }

  /**
   * Draws a longer slash attack effect on the terminal at the specified coordinates.
   *
   * @param x - The x-coordinate of the cell.
   * @param y - The y-coordinate of the cell.
   * @param color - The color of the slash.
   * @param opacityFactor - The opacity factor for the slash.
   * @param thickness - The thickness of the slash.
   */
  public drawLongerSlashAttackOverlay(
    x: number,
    y: number,
    color: string,
    opacityFactor: number,
    thickness: number,
  ): void {
    this.drawSlashOverlay(
      x,
      y,
      color,
      opacityFactor,
      thickness,
      LONG_MIN_FACTOR,
      LONG_FACTOR_RANGE,
    );
  }

  /**
   * Draws a shorter slash attack effect on the terminal at the specified coordinates.
   *
   * @param x - The x-coordinate of the cell.
   * @param y - The y-coordinate of the cell.
   * @param color - The color of the slash.
   * @param opacityFactor - The opacity factor for the slash.
   * @param thickness - The thickness of the slash.
   */
  public drawShorterSlashAttackOverlay(
    x: number,
    y: number,
    color: string,
    opacityFactor: number,
    thickness: number,
  ): void {
    this.drawSlashOverlay(
      x,
      y,
      color,
      opacityFactor,
      thickness,
      SHORT_MIN_FACTOR,
      SHORT_FACTOR_RANGE,
    );
  }

  /**
   * A helper function to draw a slash overlay given factor parameters.
   *
   * @param x - The x-coordinate of the cell.
   * @param y - The y-coordinate of the cell.
   * @param color - The color of the slash.
   * @param opacityFactor - The opacity factor.
   * @param thickness - The line thickness.
   * @param minFactor - The minimum factor for positioning.
   * @param factorRange - The range for the random factor.
   */
  public drawSlashOverlay(
    x: number,
    y: number,
    color: string,
    opacityFactor: number,
    thickness: number,
    minFactor: number,
    factorRange: number,
  ): void {
    const { horizontalSide, verticalSide, ctx } = this;
    const fx = x * horizontalSide;
    const fy = y * verticalSide;
    const direction =
      SLASH_DIRECTIONS[(Math.random() * SLASH_DIRECTIONS.length) | 0];

    ctx.strokeStyle = ManipulateColors.hexToRgba(color, opacityFactor);
    ctx.lineWidth = thickness;
    ctx.beginPath();

    // Use a helper to compute a random factor.
    const randomFactor = (): number => minFactor + Math.random() * factorRange;

    switch (direction) {
      case 'diagonalTLBR': {
        const startFactor = randomFactor();
        const endFactor = randomFactor();
        ctx.moveTo(
          fx + horizontalSide * startFactor,
          fy + verticalSide * startFactor,
        );
        ctx.lineTo(
          fx + horizontalSide * (1 - endFactor),
          fy + verticalSide * (1 - endFactor),
        );
        break;
      }
      case 'diagonalTRBL': {
        const startFactor = randomFactor();
        const endFactor = randomFactor();
        ctx.moveTo(
          fx + horizontalSide * (1 - startFactor),
          fy + verticalSide * startFactor,
        );
        ctx.lineTo(
          fx + horizontalSide * endFactor,
          fy + verticalSide * (1 - endFactor),
        );
        break;
      }
      case 'horizontal': {
        const startXFactor = randomFactor();
        const endXFactor = randomFactor();
        const tiltYStart = (Math.random() - 0.5) * verticalSide;
        const tiltYEnd = (Math.random() - 0.5) * verticalSide;
        ctx.moveTo(
          fx + horizontalSide * startXFactor,
          fy + verticalSide * 0.5 + tiltYStart,
        );
        ctx.lineTo(
          fx + horizontalSide * (1 - endXFactor),
          fy + verticalSide * 0.5 + tiltYEnd,
        );
        break;
      }
      case 'vertical': {
        const startYFactor = randomFactor();
        const endYFactor = randomFactor();
        const tiltXStart = (Math.random() - 0.5) * horizontalSide;
        const tiltXEnd = (Math.random() - 0.5) * horizontalSide;
        ctx.moveTo(
          fx + horizontalSide * 0.5 + tiltXStart,
          fy + verticalSide * startYFactor,
        );
        ctx.lineTo(
          fx + horizontalSide * 0.5 + tiltXEnd,
          fy + verticalSide * (1 - endYFactor),
        );
        break;
      }
    }
    ctx.stroke();
  }

  /**
   * Draws a projectile explosion on the terminal at the specified coordinates.
   *
   * Radiates randomly positioned and angled lines from the center of the cell at the
   * specified coordinates.
   *
   * @param x - The x-coordinate of the cell.
   * @param y - The y-coordinate of the cell.
   * @param explosionColor - The color of the explosion.
   * @param opacityFactor - The opacity factor for the explosion.
   * @param thickness - The thickness of the explosion lines.
   */
  public drawProjectileExplosion(
    x: number,
    y: number,
    explosionColor: string,
    opacityFactor: number,
    thickness: number,
  ): void {
    const centerX = x * this.horizontalSide + this.horizontalSide / 2;
    const centerY = y * this.verticalSide + this.verticalSide / 2;

    const numRays = 12;

    this.ctx.save();
    {
      this.ctx.strokeStyle = ManipulateColors.hexToRgba(
        explosionColor,
        opacityFactor,
      );
      this.ctx.lineWidth = thickness;
      this.ctx.beginPath();

      for (let i = 0; i < numRays; i++) {
        const baseAngle = (i / numRays) * Math.PI * 2;

        const randomAngle =
          baseAngle + (Math.random() - 0.5) * (Math.PI / numRays);

        const rayLength = this.horizontalSide * (0.2 + Math.random() * 0.2);

        const x2 = centerX + Math.cos(randomAngle) * rayLength;
        const y2 = centerY + Math.sin(randomAngle) * rayLength;

        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(x2, y2);
      }

      this.ctx.stroke();
    }
    this.ctx.restore();
  }
}
