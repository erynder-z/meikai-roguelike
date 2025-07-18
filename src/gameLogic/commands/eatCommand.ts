import { CommandBase } from './commandBase';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameState } from '../../types/gameBuilder/gameState';
import { Mob } from '../mobs/mob';

/**
 * Represents a command handles consuming a food item.
 */
export class EatCommand extends CommandBase {
  constructor(
    public me: Mob,
    public game: GameState,
    public amount: number,
  ) {
    super(me, game);
  }

  /**
   * Executes the eat command. For players, this decreases the hunger level and flashes a message.
   *
   * @returns Always returns true.
   */
  public execute(): boolean {
    const { game } = this;
    const { me } = this;

    const min = Math.max(0, parseFloat((this.amount * 2).toFixed(2)));
    const max = Math.min(10, parseFloat((this.amount * 10).toFixed(2)));
    const satietyAmount = game.rand.randomFloatInclusive(min, max);

    if (me.isPlayer) {
      game.stats.adjustHunger(-satietyAmount);
      const msg = new LogMessage('You feel less hungry.', EventCategory.use);

      game.flash(msg);
    }

    return true;
  }
}
