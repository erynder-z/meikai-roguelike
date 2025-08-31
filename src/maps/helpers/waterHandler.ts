import { Buff } from '../../gameLogic/buffs/buffEnum';
import { BuffCommand } from '../../gameLogic/commands/buffCommand';
import { EventCategory, LogMessage } from '../../gameLogic/messages/logMessage';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Mob } from '../../gameLogic/mobs/mob';

/**
 * Utility class for handling water related operations.
 */
export class WaterHandler {
  /**
   * Handles the effect of a water cell on the given mob.
   *
   * This effect reduces the mob's bloodiness by 0.5, removes any active Burn or Lava buffs,
   * and adds the SlightlySubmerged buff.
   *
   * @param mob The mob to handle the water cell effect for.
   * @param game The game state.
   */
  public static handleWaterCellEffect(mob: Mob, game: GameState): void {
    // remove .5 intensity of blood if mob is bloody
    if (mob.bloody.isBloody) {
      mob.bloody.intensity = Math.max(0, mob.bloody.intensity - 0.5);
      if (mob.bloody.intensity === 0) {
        mob.bloody.isBloody = false;
      }
    }

    // remove fire buffs
    const fireBuffs = [Buff.Burn, Buff.Lava];
    const activeBuffs = mob.buffs;

    fireBuffs.forEach(buff => {
      if (activeBuffs.is(buff)) {
        mob.buffs.getBuffsMap().delete(buff);
        if (mob.isPlayer) {
          game.flash(
            new LogMessage(
              `The water extinguishes the flames!`,
              EventCategory.buff,
            ),
          );
        }
      }
    });

    const isSubmerged = mob.is(Buff.SlightlySubmerged);

    if (!isSubmerged) {
      const duration = Number.MAX_SAFE_INTEGER;
      new BuffCommand(
        Buff.SlightlySubmerged,
        mob,
        game,
        mob,
        duration,
      ).execute();

      const flash = new LogMessage(
        'You are wading through shallow water.',
        EventCategory.buff,
      );
      if (mob.isPlayer) game.flash(flash);
    }
  }

  /**
   * Handles the effect of leaving a water cell for a given mob.
   *
   * This effect removes the `SlightlySubmerged` buff.
   *
   * @param mob The mob to handle the leaving water cell effect for.
   * @param game The game state.
   */
  public static handleLeavingWater(mob: Mob, game: GameState): void {
    if (mob.is(Buff.SlightlySubmerged)) {
      mob.buffs.cleanse(Buff.SlightlySubmerged, game, mob);
      if (mob.isPlayer) {
        const flash = new LogMessage(
          'You are no longer in the water.',
          EventCategory.buff,
        );
        game.flash(flash);
      }
    }
  }
}
