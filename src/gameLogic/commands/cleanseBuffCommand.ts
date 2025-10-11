import { GameState } from '../../shared-types/gameBuilder/gameState';
import { MobMessagesHandler } from '../../ui/messages/mobMessagesHandler';
import { Buff } from '../buffs/buffEnum';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { Mob } from '../mobs/mob';
import { CommandBase } from './commandBase';

/**
 * Represents a command that removes a given buff from the given mob.
 */
export class CleanseBuffCommand extends CommandBase {
  constructor(
    public buff: Buff,
    public me: Mob,
    public game: GameState,
  ) {
    super(me, game);
  }

  /**
   * Executes the command to cleanse a specific buff from the mob.
   *
   * @return Returns true if the command was executed successfully.
   */
  public execute(): boolean {
    const { me, game } = this;
    const { player } = game;

    if (this.buff) this.me.buffs.cleanse(this.buff, game, me);

    if (
      me.isPlayer ||
      MobMessagesHandler.shouldDisplayMessageBasedOnVisibility(game, me, player)
    ) {
      const s = me.isPlayer ? 'You are' : `${me.name} is`;
      const msg = new LogMessage(
        `${s} cleansed of ${Buff[this.buff]}!`,
        EventCategory.heal,
      );

      game.message(msg);
    }

    return true;
  }
}
