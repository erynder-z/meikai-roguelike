import { Buff } from '../../gameLogic/buffs/buffEnum';
import { BuffCommand } from '../../gameLogic/commands/buffCommand';
import { EventCategory, LogMessage } from '../../gameLogic/messages/logMessage';
import { GameState } from '../../types/gameBuilder/gameState';
import { Mob } from '../../gameLogic/mobs/mob';

/**
 * Utility class for handling nebulous mist related operations.
 */
export class NebulousMistHandler {
  /**
   * Handles the effect of a nebulous mist cell on the given mob.
   *
   * This effect adds the NebulousMist buff which should cause blindness.
   *
   * @param mob The mob to handle the nebulous mist cell effect for.
   * @param game The game state.
   */
  public static handleNebulousMistCellEffect(mob: Mob, game: GameState): void {
    const isInMist = mob.is(Buff.NebulousMist);

    if (!isInMist) {
      const duration = Number.MAX_SAFE_INTEGER;
      new BuffCommand(
        Buff.NebulousMist,
        mob,
        game,
        mob,
        duration,
      ).execute();

      const flash = new LogMessage(
        'A thick mist surrounds you, making it hard to see.',
        EventCategory.buff,
      );
      if (mob.isPlayer) game.flash(flash);
    }
  }

  /**
   * Handles the effect of leaving a nebulous mist cell for a given mob.
   *
   * This effect removes the `NebulousMist` buff.
   *
   * @param mob The mob to handle the leaving nebulous mist cell effect for.
   * @param game The game state.
   */
  public static handleLeavingNebulousMist(mob: Mob, game: GameState): void {
    if (mob.is(Buff.NebulousMist)) {
      mob.buffs.cleanse(Buff.NebulousMist, game, mob);
      if (mob.isPlayer) {
        const flash = new LogMessage(
          'You step out of the mist.',
          EventCategory.buff,
        );
        game.flash(flash);
      }
    }
  }
}