import { CanSee } from '../maps/helpers/canSee';
import { EnvironmentChecker } from '../gameLogic/environment/environmentChecker';
import { gameConfigManager } from '../gameConfigManager/gameConfigManager';
import { GameMapType } from '../shared-types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../shared-types/gameBuilder/gameState';
import { Mob } from '../gameLogic/mobs/mob';
import { WorldPoint } from '../maps/mapModel/worldPoint';

export class BloodVisualsHandler {
  private static get bloodIntensity(): number {
    return gameConfigManager.getConfig().blood_intensity;
  }

  /**
   * Handles the visual blood effects when a mob is attacked and takes damage.
   *
   * This function applies blood effects based on the damage dealt to a target mob.
   * If the blood intensity setting is enabled and the target is not dead, it
   * calculates the damage ratio and chance of blood splatter. If the damage
   * is significant or a random chance condition is met, blood is added to
   * the target's cell on the map.
   *
   * @param target - The mob that is attacked and may bleed.
   * @param dmg - The amount of damage dealt to the target.
   * @param game - The current game state.
   */

  public static handleAttackBlood(
    target: Mob,
    dmg: number,
    game: GameState,
  ): void {
    if (this.bloodIntensity === 0 || !target.pos || target.hp <= 0) return;

    const map = game.currentMap();
    if (!map) return;

    const damageRatio = dmg / target.maxhp;
    const chance = dmg / target.hp;
    const SIGNIFICANT_DAMAGE_THRESHOLD = 0.25;

    if (damageRatio >= SIGNIFICANT_DAMAGE_THRESHOLD || Math.random() < chance) {
      this.addBloodToCell(target.pos, map, damageRatio);
    }
  }

  /**
   * Handles the visual blood effects when a mob takes damage from a tick.
   *
   * This function applies blood effects based on the intensity of the tick.
   * If the blood intensity setting is enabled, it adds blood to the target's
   * cell on the map.
   *
   * @param target - The mob that is bleeding due to a tick.
   * @param intensity - The intensity of the tick.
   * @param game - The current game state.
   */
  public static handleTickBlood(
    target: Mob,
    intensity: number,
    game: GameState,
  ): void {
    if (this.bloodIntensity === 0) return;

    const map = game.currentMap();
    if (map) this.addBloodToCell(target.pos, map, intensity);
  }

  /**
   * Adds blood to the cell at the given world position based on the given damage ratio.
   *
   * The blood intensity is determined by the blood intensity setting and the damage ratio.
   * If the damage ratio is high enough, it also causes a blood splash in the surrounding cells.
   *
   * @param wp - The world position of the cell to add blood to.
   * @param map - The map containing the cell.
   * @param damageRatio - The ratio of damage dealt to the target's max HP.
   */
  private static addBloodToCell(
    wp: WorldPoint,
    map: GameMapType,
    damageRatio: number,
  ): void {
    const cell = map.cell(wp);
    cell.bloody.isBloody = true;

    const MAX_BLOOD_INTENSITY =
      this.bloodIntensity === 3 ? 2.0 : this.bloodIntensity === 2 ? 1.5 : 1.0;
    const bloodMultiplier =
      this.bloodIntensity === 3 ? 1.75 : this.bloodIntensity === 2 ? 1.25 : 1.0;

    const thresholds = [
      { threshold: 0.2, blood: 0.5, splashArea: 0, splashIntensity: 0 },
      { threshold: 0.5, blood: 1.0, splashArea: 1, splashIntensity: 1.0 },
      { threshold: 0.7, blood: 1.5, splashArea: 2, splashIntensity: 1.5 },
      { threshold: Infinity, blood: 2.0, splashArea: 3, splashIntensity: 2.0 },
    ];

    const entry = thresholds.find(t => damageRatio <= t.threshold);
    if (!entry) return;

    const randomModifier = 1 + (Math.random() * 0.3 - 0.15);
    const finalBlood = entry.blood * randomModifier * bloodMultiplier;

    cell.bloody.intensity = Math.min(
      cell.bloody.intensity + finalBlood,
      MAX_BLOOD_INTENSITY,
    );

    if (entry.splashArea > 0) {
      this.addBloodSplash(
        wp,
        map,
        entry.splashArea,
        entry.splashIntensity * bloodMultiplier,
      );
    }
  }

  /**
   * Adds blood to the cells surrounding the given world position, up to a given distance.
   *
   * The blood intensity is determined by the blood intensity setting and the distance to the source.
   * If the blood intensity is high enough, it also causes the mob that is in the cell to be covered in blood.
   *
   * @param wp - The world position of the cell to add blood to.
   * @param map - The map containing the cell.
   * @param area - The distance from the source to spread blood.
   * @param baseIntensity - The base intensity of the blood.
   */
  private static addBloodSplash(
    wp: WorldPoint,
    map: GameMapType,
    area: number,
    baseIntensity: number,
  ): void {
    const neighbors = wp.getNeighbors(area);
    const MAX_BLOOD_INTENSITY =
      this.bloodIntensity === 3 ? 2.0 : this.bloodIntensity === 2 ? 1.5 : 1.0;
    const bloodMultiplier =
      this.bloodIntensity === 3 ? 1.75 : this.bloodIntensity === 2 ? 1.25 : 1.0;

    for (const neighbor of neighbors) {
      if (!EnvironmentChecker.isValidNeighbor(neighbor, map)) continue;
      if (!CanSee.checkPointLOS_RayCast(wp, neighbor, map)) continue;

      const neighborCell = map.cell(neighbor);
      const distance = wp.distanceTo(neighbor);
      const intensityModifier = 1 - distance / area;
      const randomModifier = 1 + (Math.random() * 0.3 - 0.15);
      let finalIntensity =
        baseIntensity * intensityModifier * randomModifier * bloodMultiplier;

      if (distance >= area - 2 && Math.random() < 0.5) {
        finalIntensity *= 0.5;
      }

      if (finalIntensity > 0) {
        // add blood to cell
        neighborCell.bloody.isBloody = true;
        neighborCell.bloody.intensity = Math.min(
          neighborCell.bloody.intensity + finalIntensity,
          MAX_BLOOD_INTENSITY,
        );

        if (neighborCell.mob) {
          // add blood to mob
          neighborCell.mob.bloody.isBloody = true;
          neighborCell.mob.bloody.intensity = Math.min(
            neighborCell.mob.bloody.intensity + finalIntensity,
            MAX_BLOOD_INTENSITY,
          );
        }
      }
    }
  }
}
