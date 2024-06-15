import { GameIF } from '../Builder/Interfaces/GameIF';
import { HealthAdjust } from '../Commands/HealthAdjust';
import { MapIF } from '../MapModel/Interfaces/MapIF';
import { WorldPoint } from '../MapModel/WorldPoint';
import { EventCategory, LogMessage } from '../Messages/LogMessage';
import { Mob } from '../Mobs/Mob';
import { StepIF } from './Interfaces/StepIF';
import { TimedStep } from './TimedStep';

/**
 * Represents a timed step that damages a mob at its current position.
 */
export class DamageStep extends TimedStep {
  constructor(
    public amount: number,
    public _rangedWeaponType: RangedWeaponType,
    public actor: Mob,
    public game: GameIF,
    public target: Mob | null = null,
    public pos: WorldPoint | null = null,
  ) {
    super();
  }

  /**
   * Sets the target of the function to the specified Mob.
   *
   * @param {Mob} tgt - The Mob object to set as the target.
   * @return {void} This function does not return anything.
   */
  setTarget(tgt: Mob): void {
    this.target = tgt;
  }

  /**
   * Sets the position of the object to the specified world point.
   *
   * @param {WorldPoint} pos - The world point to set the position to.
   * @return {void} This function does not return anything.
   */
  setPos(pos: WorldPoint): void {
    this.pos = pos.copy();
  }

  /**
   * Executes the step and damages the target.
   *
   * @return {StepIF | null} The executed step or null if no target is found.
   */
  executeStep(): StepIF | null {
    let tgt = this.target;
    if (!tgt) tgt = this.targetFromPosition();
    if (tgt) {
      const msg = new LogMessage(
        ` ${tgt.name} gets hit by a ranged weapon for ${this.amount} damage`,
        EventCategory.none,
      );

      this.game.message(msg);

      HealthAdjust.damage(tgt, this.amount, this.game, this.actor);
    } else {
      console.log('did not hit any target');
    }
    return null;
  }

  /**
   * Retrieves the target Mob based on the current position.
   *
   * @return {Mob | null} The target Mob if found, otherwise null.
   */
  targetFromPosition(): Mob | null {
    if (this.pos) {
      const map = <MapIF>this.game.currentMap();
      const cell = map.cell(this.pos);
      if (cell.mob) return cell.mob;
    }
    return null;
  }

  /**
   * Returns the type of ranged weapon used in this step.
   *
   * @return {RangedWeaponType} The type of ranged weapon.
   */
  rangedWeaponType(): RangedWeaponType {
    return this._rangedWeaponType;
  }
}

export enum RangedWeaponType {
  Pistol,
  Rifle,
  Crossbow,
  Bow,
}
