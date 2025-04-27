import { GameState } from '../../types/gameBuilder/gameState';
import { HealthAdjust } from '../commands/healthAdjust';
import { LogMessage, EventCategory } from '../messages/logMessage';
import { Mob } from '../mobs/mob';
import { Tick } from '../../types/gameLogic/buffs/buffType';

/**
 * Handles a poison tick.
 */
export class PoisonTick implements Tick {
  private readonly poisonDamage: number = 1;

  constructor(
    public mob: Mob,
    public game: GameState,
  ) {}

  /**
   * Determines if damage should be applied based on the current turn.
   * The initial tick always applies damage. After that, damage is applied on odd turns.
   *
   * @param {number} duration - The total duration of the bleed effect.
   * @param {number} timeLeft - The remaining time for the bleed effect.
   * @return {boolean} True if damage should be applied on odd turns, false otherwise.
   */
  private shouldApplyDamage(duration: number, timeLeft: number): boolean {
    const turnNumber = duration - timeLeft;

    return turnNumber % 2 !== 0;
  }

  /**
   * Performs a tick action based on the duration and time left.
   *
   * @param {number} duration - The duration of the tick action.
   * @param {number} timeLeft - The remaining time for the tick action.
   */
  public tick(duration: number, timeLeft: number): void {
    if (this.shouldApplyDamage(duration, timeLeft)) return;

    if (this.mob.isPlayer) {
      this.game.message(
        new LogMessage(
          `You take ${this.poisonDamage} damage because of the poison!`,
          EventCategory.playerDamage,
        ),
      );
    }

    HealthAdjust.damage(this.mob, this.poisonDamage, this.game, null);
  }
}
