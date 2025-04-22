import { Buff } from '../../gameLogic/buffs/buffEnum';
import { BuffCommand } from '../../gameLogic/commands/buffCommand';
import { CleanseBuffCommand } from '../../gameLogic/commands/cleanseBuffCommand';
import { GameState } from '../../types/gameBuilder/gameState';
import { Mob } from '../../gameLogic/mobs/mob';

/**
 * Utility class for handling water related operations.
 */
export class WaterHandler {
  /**
   * Handles the effect of a water cell on the given mob.
   *
   * This effect reduces the mob's bloodiness by 0.5, removes any active Burn or Lava buffs,
   * and adds a Slow buff for 2 turns.
   *
   * @param {Mob} mob The mob to handle the water cell effect for.
   * @param {GameState} game The game state.
   * @return {void} This function does not return a value.
   */
  public static handleWaterCellEffect(mob: Mob, game: GameState): void {
    // remove .5 intensity of blood if mob is bloody
    if (mob.bloody.isBloody) {
      mob.bloody.intensity = Math.max(0, mob.bloody.intensity - 0.5);
      if (mob.bloody.intensity === 0) {
        mob.bloody.isBloody = false;
      }
    }

    const duration = 2;
    new BuffCommand(Buff.Slow, mob, game, mob, duration).execute();

    const fireBuffs = [Buff.Burn, Buff.Lava];
    const activeBuffs = mob.buffs;

    fireBuffs.forEach(buff => {
      if (activeBuffs.is(buff)) {
        new CleanseBuffCommand(buff, mob, game).execute();
      }
    });
  }
}
