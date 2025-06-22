import { Mob } from '../mobs/mob';
import { Step } from '../../types/gameLogic/stepper/step';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Represents a timed step that draws a step screen for a given amount of time. Most methods are placeholders to be implemented in subclasses.
 */
export class TimedStep implements Step {
  public time: number = 0;

  /**
   * Executes the step.
   *
   * @return The function always throws an error.
   */
  public executeStep(): Step | null {
    throw 'no executeStep';
  }

  /**
   * Sets the position of the object to the specified world point.
   *
   * @param pos - The world point to set the position to.
   */
  public setPos(pos: WorldPoint): void {
    throw 'no setPos';
  }

  /**
   * Sets the direction of the object to the specified world point.
   *
   * @param dir - The world point to set the direction to.
   */
  public setDirection(dir: WorldPoint): void {
    throw 'no setDir';
  }

  /**
   * Sets the target of the function to the specified Mob.
   *
   * @param tgt - The Mob object to set as the target.
   */
  public setTarget(tgt: Mob): void {
    throw 'no setTarget';
  }

  /**
   * Sets the time value of the object.
   *
   * @param time - The time value to be set.
   */
  public setTime(time: number): void {
    this.time = time;
  }
}
