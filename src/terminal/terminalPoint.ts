import { gameConfigManager } from '../gameConfigManager/gameConfigManager';

/**
 * Represents a point in a terminal grid with x and y coordinates.
 */
export class TerminalPoint {
  constructor(
    public x: number = 0,
    public y: number = 0,
  ) {}

  /**
   * Gets the dimensions of the terminal as a TerminalPoint object.
   * The width and height are read from the game configuration.
   */
  public static get TerminalDimensions(): TerminalPoint {
    const gameConfig = gameConfigManager.getConfig();
    return new TerminalPoint(
      gameConfig.terminal.dimensions.width,
      gameConfig.terminal.dimensions.height,
    );
  }
  public static MapDimensions = new TerminalPoint(96, 48);
}
