import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameState } from '../../types/gameBuilder/gameState';
import { HealthAdjust } from '../commands/healthAdjust';
import { Mob } from '../mobs/mob';
import { Tick } from '../../types/gameLogic/buffs/buffType';

/**
 * Handles a petrify tick.
 */
export class PetrifyTick implements Tick {
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
   * Ticks the petrify effect on the mob.
   *
   * @param {number} duration - The duration of the petrify effect.
   * @param {number} timeLeft - The time left in the petrify effect.
   * @return {void} This function does not return a value.
   */
  public tick(duration: number, timeLeft: number): void {
    if (!this.shouldApplyDamage(duration, timeLeft)) return;
    const sinceLastMove = this.mob.sinceMove;
    if (sinceLastMove < 2) return;
    const dmg = this.game.rand.randomIntegerClosedRange(
      sinceLastMove,
      sinceLastMove * 2,
    );
    if (this.mob.isPlayer) {
      const msg = new LogMessage(
        `You are being petrified and take ${dmg} damage!`,
        EventCategory.playerDamage,
      );
      this.game.message(msg);
    }

    HealthAdjust.damage(this.mob, dmg, this.game, null);
  }
}
