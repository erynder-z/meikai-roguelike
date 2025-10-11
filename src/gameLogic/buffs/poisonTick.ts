import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Tick } from '../../shared-types/gameLogic/buffs/buffType';
import { HealthAdjust } from '../commands/healthAdjust';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { Mob } from '../mobs/mob';

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
   * @param duration - The total duration of the bleed effect.
   * @param timeLeft - The remaining time for the bleed effect.
   * @return True if damage should be applied on odd turns, false otherwise.
   */
  private shouldApplyDamage(duration: number, timeLeft: number): boolean {
    const turnNumber = duration - timeLeft;

    return turnNumber % 2 !== 0;
  }

  /**
   * Performs a tick action based on the duration and time left.
   *
   * @param duration - The duration of the tick action.
   * @param timeLeft - The remaining time for the tick action.
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
