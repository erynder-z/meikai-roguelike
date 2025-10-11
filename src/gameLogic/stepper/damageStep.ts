import { WorldPoint } from '../../maps/mapModel/worldPoint';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { GameMapType } from '../../shared-types/gameLogic/maps/mapModel/gameMapType';
import { Step } from '../../shared-types/gameLogic/stepper/step';
import { BloodVisualsHandler } from '../../utilities/bloodVisualsHandler';
import { HealthAdjust } from '../commands/healthAdjust';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { Mob } from '../mobs/mob';
import { TimedStep } from './timedStep';

/**
 * Represents a timed step that damages a mob at its current position.
 */
export class DamageStep extends TimedStep {
  constructor(
    public amount: number,
    public weaponType: RangedWeaponType,
    public actor: Mob,
    public game: GameState,
    public target: Mob | null = null,
    public pos: WorldPoint | null = null,
  ) {
    super();
  }

  /**
   * Sets the target of the function to the specified Mob.
   *
   * @param tgt - The Mob object to set as the target.
   */
  public setTarget(tgt: Mob): void {
    this.target = tgt;
  }

  /**
   * Sets the position of the object to the specified world point.
   *
   * @param pos - The world point to set the position to.
   */
  public setPos(pos: WorldPoint): void {
    this.pos = pos.copy();
  }

  /**
   * Executes the step and damages the target.
   *
   * @return The executed step or null if no target is found.
   */
  public executeStep(): Step | null {
    let tgt = this.target;
    if (!tgt) tgt = this.targetFromPosition();
    if (tgt) {
      const msg = new LogMessage(
        ` ${tgt.name} gets hit by a ranged weapon for ${this.amount} damage`,
        EventCategory.none,
      );

      this.game.message(msg);

      if (this.amount > 0)
        BloodVisualsHandler.handleAttackBlood(tgt, this.amount, this.game);

      HealthAdjust.damage(tgt, this.amount, this.game, this.actor);
    } else {
      console.log('did not hit any target');
    }
    return null;
  }

  /**
   * Retrieves the target Mob based on the current position.
   *
   * @return The target Mob if found, otherwise null.
   */
  private targetFromPosition(): Mob | null {
    if (this.pos) {
      const map = <GameMapType>this.game.currentMap();
      const cell = map.cell(this.pos);
      if (cell.mob) return cell.mob;
    }
    return null;
  }

  /**
   * Returns the type of ranged weapon used in this step.
   *
   * @return The type of ranged weapon.
   */
  public rangedWeaponType(): RangedWeaponType {
    return this.weaponType;
  }
}

export enum RangedWeaponType {
  Pistol,
  Rifle,
  Crossbow,
  Bow,
}
