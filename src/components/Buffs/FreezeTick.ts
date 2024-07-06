import { EventCategory } from '../Messages/LogMessage';
import { GameIF } from '../Builder/Interfaces/GameIF';
import { HealthAdjust } from '../Commands/HealthAdjust';
import { LogMessage } from '../Messages/LogMessage';
import { Mob } from '../Mobs/Mob';
import { TickIF } from './Interfaces/BuffIF';

/**
 * Handles a freeze tick.
 */
export class FreezeTick implements TickIF {
  constructor(
    public mob: Mob,
    public game: GameIF,
  ) {}

  /**
   * Executes a tick of the FreezeTick class.
   * Deals 0-2 damage every second turn if not moving for 2 or more turns.
   *
   * @param {number} time - The current time of the game.
   * @return {void} This function does not return anything.
   */
  public tick(time: number): void {
    if (time % 2) return;
    if (this.mob.sinceMove < 2) return;
    const dmg = this.game.rand.randomIntegerClosedRange(0, 2);
    if (this.mob.isPlayer) {
      const msg = new LogMessage(
        `You take ${dmg} damage because you are freezing!`,
        EventCategory.playerDamage,
      );
      this.game.message(msg);
    }

    HealthAdjust.damage(this.mob, dmg, this.game, null);
  }
}
