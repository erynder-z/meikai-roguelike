import { CanSee } from '../../maps/helpers/canSee';
import { GameMap } from '../../maps/mapModel/gameMap';
import { GameState } from '../../types/gameBuilder/gameState';
import { Mob } from '../../gameLogic/mobs/mob';

export class MobMessagesHandler {
  /**
   * Determines whether a message should be displayed based on the visibility of the mob to the player.
   *
   * @param game - The current game state.
   * @param mob - The mob for which the message is being considered.
   * @param player - The player mob.
   * @return True if the message should be displayed, false otherwise.
   */
  public static shouldDisplayMessageBasedOnVisibility(
    game: GameState,
    mob: Mob,
    player: Mob,
  ): boolean {
    const map = game.currentMap() as GameMap;

    // Check if the player is within visibility range of the mob.
    const visibilityRange = game.stats.currentVisibilityRange;
    const visRadius = visibilityRange / 2;
    const isWithinRange = CanSee.isDistanceSmallerThan(
      mob.pos,
      player.pos,
      visRadius,
    );

    if (!isWithinRange) return false;

    // Check if the mob has a line of sight to the player.
    const hasLineOfSight = CanSee.checkMobLOS_Bresenham(player, mob, map, true);
    if (!hasLineOfSight) return false;

    return true;
  }
}
