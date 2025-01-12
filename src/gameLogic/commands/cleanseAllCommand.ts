import { CommandBase } from './commandBase';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameState } from '../../types/gameBuilder/gameState';
import { Mob } from '../mobs/mob';

/**
 * Represents a command that removes all buffs from the given mob.
 */
export class CleanseAllCommand extends CommandBase {
  constructor(
    public me: Mob,
    public game: GameState,
  ) {
    super(me, game);
  }

  /**
   * Executes the cleanse all command, removing all buffs from the mob.
   *
   * @return {boolean} Returns true if the command was executed successfully.
   */
  public execute(): boolean {
    const { me, game } = this;

    const buffsMap = me.buffs.getBuffsMap();
    buffsMap.clear();

    const msg = new LogMessage(`Cleansed all buffs!`, EventCategory.heal);

    game.message(msg);

    return true;
  }
}
