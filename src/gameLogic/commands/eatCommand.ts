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
   * @returns {boolean} Always returns true.
   */
  public execute(): boolean {
    const { game } = this;
    const { me } = this;

    const satietyAmount = game.rand.randomFloatInclusive(
      parseFloat(Math.round(this.amount * 0.5).toFixed(2)),
      this.amount,
    );

    if (me.isPlayer) {
      game.stats.adjustHunger(-satietyAmount);
      const msg = new LogMessage('You feel less hungry.', EventCategory.use);

      game.flash(msg);
    }

    return true;
  }
}
