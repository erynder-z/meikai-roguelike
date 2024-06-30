import { GameIF } from '../Builder/Interfaces/GameIF';
import { EventCategory } from '../Messages/LogMessage';
import { Mob } from '../Mobs/Mob';
import { CommandBase } from './CommandBase';

/**
 * Represents a wait command that ends the turn for the mob.
 */
export class WaitCommand extends CommandBase {
  constructor(
    public me: Mob,
    public game: GameIF,
  ) {
    super(me, game);
  }
  /**
   * Executes the wait command.
   * @returns {boolean} Always returns true.
   */
  public execute(): boolean {
    const g = this.game;

    g.addCurrentEvent(EventCategory.wait);

    console.log('wait');

    return true;
  }
}
