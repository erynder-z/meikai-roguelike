import { GameState } from '../../types/gameBuilder/gameState';

/**
 * Handles various needs of the player, such as hunger and thirst.
 */
export class NeedsHandler {
  constructor() {}
  /**
   * Increases the hunger level of the player by a small fixed amount.
   * Ensures that the hunger level does not exceed the maximum threshold.
   *
   * @param {GameState} game - The current state of the game.
   * @return {void} This function does not return a value.
   */

  public increaseHunger(game: GameState): void {
    const increaseAmount = 0.0005;
    const MAX_HUNGER = 1.0;
    game.stats.hunger = Math.min(
      MAX_HUNGER,
      parseFloat((game.stats.hunger + increaseAmount).toFixed(4)),
    );
  }

  /**
   * Increases the thirst level of the player by a small fixed amount.
   * Ensures that the thirst level does not exceed the maximum threshold.
   *
   * @param {GameState} game - The current state of the game.
   * @return {void} This function does not return a value.
   */
  public increaseThirst(game: GameState): void {
    const increaseAmount = 0.0005;
    const MAX_THIRST = 1.0;
    game.stats.thirst = Math.min(
      MAX_THIRST,
      parseFloat((game.stats.thirst + increaseAmount).toFixed(4)),
    );
  }
}
