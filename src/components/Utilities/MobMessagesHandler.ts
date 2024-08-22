import { GameState } from '../Builder/Types/GameState';
import { GameMap } from '../MapModel/GameMap';
import { Mob } from '../Mobs/Mob';
import { CanSee } from './CanSee';

export class MobMessagesHandler {
  /**
   * Determines whether a message should be displayed based on the visibility of the mob to the player.
   *
   * @param {GameState} game - The current game state.
   * @param {Mob} mob - The mob for which the message is being considered.
   * @param {Mob} player - The player mob.
   * @return {boolean} True if the message should be displayed, false otherwise.
   */
  public static shouldDisplayMessage(
    game: GameState,
    mob: Mob,
    player: Mob,
  ): boolean {
    const map = game.currentMap() as GameMap;

    // Check if the player is within visibility range of the mob.
    const visibilityRange = game.stats.currentVisRange;
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
