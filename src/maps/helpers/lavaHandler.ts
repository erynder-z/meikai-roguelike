import { Buff } from '../../gameLogic/buffs/buffEnum';
import { BuffCommand } from '../../gameLogic/commands/buffCommand';
import { EventCategory, LogMessage } from '../../gameLogic/messages/logMessage';
import { GameState } from '../../types/gameBuilder/gameState';
import { Mob } from '../../gameLogic/mobs/mob';

/**
 * Utility class for handling lava related operations.
 */
export class LavaHandler {
  /**
   * Handles the effect of a lava cell on the given mob.
   *
   * This effect adds the Lava buff which should cause burning damage.
   *
   * @param mob The mob to handle the lava cell effect for.
   * @param game The game state.
   */
  public static handleLavaCellEffect(mob: Mob, game: GameState): void {
    const isInLava = mob.is(Buff.Lava);

    if (!isInLava) {
      const duration = Number.MAX_SAFE_INTEGER;
      new BuffCommand(Buff.Lava, mob, game, mob, duration).execute();

      const flash = new LogMessage(
        'You are burning in lava!',
        EventCategory.buff,
      );
      if (mob.isPlayer) game.flash(flash);
    }
  }

  /**
   * Handles the effect of leaving a lava cell for a given mob.
   *
   * This effect removes the `Lava` buff and applies a `Burn` buff for a few turns.
   *
   * @param mob The mob to handle the leaving lava cell effect for.
   * @param game The game state.
   */
  public static handleLeavingLava(mob: Mob, game: GameState): void {
    if (mob.is(Buff.Lava)) {
      mob.buffs.getBuffsMap().delete(Buff.Lava);

      const burnDuration = 5;
      new BuffCommand(Buff.Burn, mob, game, mob, burnDuration).execute();

      if (mob.isPlayer) {
        const flash = new LogMessage(
          'You step out of the lava, but you are still burning!',
          EventCategory.buff,
        );
        game.flash(flash);
      }
    }
  }
}
