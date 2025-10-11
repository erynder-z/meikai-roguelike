import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Tick } from '../../shared-types/gameLogic/buffs/buffType';
import { HealthAdjust } from '../commands/healthAdjust';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { Mob } from '../mobs/mob';

/**
 * Handles a burn tick.
 */
export class BurnTick implements Tick {
  constructor(
    public mob: Mob,
    public game: GameState,
    private readonly MIN_DAMAGE: number = 2,
    private readonly MAX_DAMAGE: number = 4,
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
   * Ticks the burn effect on the mob.
   *
   * @param duration - The duration of the burn effect.
   * @param timeLeft - The time left in the burn effect.
   */
  public tick(duration: number, timeLeft: number): void {
    if (!this.shouldApplyDamage(duration, timeLeft)) return;
    const dmg = this.game.rand.randomIntegerInclusive(
      this.MIN_DAMAGE,
      this.MAX_DAMAGE,
    );
    if (this.mob.isPlayer) {
      const msg = new LogMessage(
        `You take ${dmg} damage because of the burn!`,
        EventCategory.playerDamage,
      );
      this.game.message(msg);
    }

    HealthAdjust.damage(this.mob, dmg, this.game, null);
  }
}
