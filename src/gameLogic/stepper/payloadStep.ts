import { Command } from '../../shared-types/gameLogic/commands/command';
import { GameMapType } from '../../shared-types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Mob } from '../mobs/mob';
import { Step } from '../../shared-types/gameLogic/stepper/step';
import { TimedStep } from './timedStep';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Represents a payload step that fires a payload command in a specified direction.
 */
export class PayloadStep extends TimedStep {
  constructor(
    public actor: Mob,
    public game: GameState,
    public payload: Command,
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
   * Executes the step and performs the payload action on the target mob.
   *
   * @return The executed step or null if no target is found.
   */
  public executeStep(): Step | null {
    let { target } = this;

    if (!target) target = this.targetFromPosition();
    if (target) {
      this.payload.setTarget(target);
      this.payload.raw();
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
}
