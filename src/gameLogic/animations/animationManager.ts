import { AttackAnimationType } from '../../types/gameLogic/animations/animationTypes';
import * as animationData from './data/attackAnimations.json';

type AttackAnimation = {
  type: AttackAnimationType;
  color: string;
  opacityFactor: number;
  thickness: number;
};

/**
 * Manages the available attack animations and provides methods for retrieving specific animations.
 */
export class AnimationManager {
  private static animations: AttackAnimation[] =
    animationData.animations as AttackAnimation[];

  /**
   * Retrieves an attack animation of the specified type.
   *
   * @param type - The type of attack animation to retrieve.
   * @returns The attack animation that matches the specified type, or undefined if no match is found.
   */
  public static getAnimation(
    type: AttackAnimationType,
  ): AttackAnimation | undefined {
    return this.animations.find(anim => anim.type === type);
  }
}
