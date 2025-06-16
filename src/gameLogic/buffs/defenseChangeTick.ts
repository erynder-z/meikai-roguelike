import { GameState } from '../../types/gameBuilder/gameState';
import { Mob } from '../mobs/mob';
import { Tick } from '../../types/gameLogic/buffs/buffType';

/**
 * Handles a tick during the attackUp buff.
 */
export class DefenseChangeTick implements Tick {
  constructor(
    public mob: Mob,
    public game: GameState,
    public amount: number,
  ) {}

  /**
   * Checks if the current tick is the final tick.
   *
   * @param {number} timeLeft - The time left in the modifier.
   * @return {boolean} True if it is the final tick, false otherwise.
   */
  private isFinalTick(timeLeft: number): boolean {
    return timeLeft === 0;
  }

  /**
   * Applies the defense modifier to the game state.
   *
   * @param {number} duration - The duration of the defense modifier.
   * @param {number} timeLeft - The time left in the modifier.
   */
  public tick(duration: number, timeLeft: number): void {
    if (!this.isFinalTick(timeLeft)) return;

    this.game.stats.adjustDamageReceiveModifier(-this.amount);
  }
}
