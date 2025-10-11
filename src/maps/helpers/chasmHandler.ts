import { HealthAdjust } from '../../gameLogic/commands/healthAdjust';
import { EventCategory, LogMessage } from '../../gameLogic/messages/logMessage';
import { Mob } from '../../gameLogic/mobs/mob';
import { GameState } from '../../shared-types/gameBuilder/gameState';

/**
 * Utility class for handling chams.
 */
export class ChasmHandler {
  /**
   * Handle moving on a chasm edge cell.
   *
   * There is a one in 4 chance of falling into the chasm.
   * If the mob is the player, a message is printed to the log.
   * Otherwise, the mob is moved to the center of the chasm.
   *
   * @param mob The mob to handle.
   * @param game The current game state.
   */
  public static handleChasmEdge(mob: Mob, game: GameState): void {
    const fallChance = game.rand.isOneIn(4);

    if (fallChance) {
      this.handleChasmCenter(mob, game);
    } else {
      if (mob.isPlayer)
        game.flash(
          new LogMessage(
            'You feel the ground beneath your feet crumbling.',
            EventCategory.chasmDanger,
          ),
        );
    }
  }

  /**
   * Handles a mob falling into the center of a chasm.
   *
   * A message is printed to the log, and the mob is either killed or removed
   * depending on whether it is the player mob.
   *
   * @param mob The mob to handle.
   * @param game The current game state.
   */
  public static handleChasmCenter(mob: Mob, game: GameState): void {
    const s = mob.isPlayer ? 'You fall' : `${mob.name} falls`;
    const msg = new LogMessage(
      `${s} into the abyss!`,
      EventCategory.playerDeath,
    );
    game.message(msg);

    if (mob.isPlayer) {
      HealthAdjust.damage(mob, mob.hp, game, null);
    } else {
      HealthAdjust.mobDeathWithoutCorpseAndLoot(mob, game, true);
    }
  }
}
