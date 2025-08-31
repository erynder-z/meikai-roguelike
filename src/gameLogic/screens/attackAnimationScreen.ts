import { AnimationManager } from '../animations/animationManager';
import { AttackAnimationType } from '../../shared-types/gameLogic/animations/animationTypes';
import { BaseScreen } from './baseScreen';
import { DrawableTerminal } from '../../shared-types/terminal/drawableTerminal';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../shared-types/terminal/stack';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

export class AttackAnimationScreen extends BaseScreen {
  public name = 'attack-animation-screen';

  constructor(
    public game: GameState,
    public make: ScreenMaker,
    public pos: WorldPoint,
    public isAttackByPlayer: boolean,
    public isDig: boolean,
    public isRanged: boolean,
  ) {
    super(game, make);
  }

  /**
   * Handles key down events.
   *
   * @param event - The keyboard event.
   * @param stack - The stack of screens.
   * @return True if the event was handled successfully, otherwise false.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): boolean {
    return false;
  }

  /**
   * Draws the attack animation screen on the provided terminal.
   *
   * @param term - The terminal to draw on.
   */
  public drawScreen(term: DrawableTerminal): void {
    let attackType: AttackAnimationType;

    if (this.isDig) {
      attackType = 'burst';
    } else if (this.isRanged) {
      attackType = 'ranged';
    } else {
      attackType = this.isAttackByPlayer ? 'longerSlash' : 'shorterSlash';
    }
    this.drawAttackAnimation(term, attackType);
  }

  /**
   * Removes the attack animation screen from the stack.
   *
   * @param stack - The stack of screens.
   * @return True if the screen was popped successfully, otherwise false.
   */
  public onTime(stack: Stack): boolean {
    stack.removeScreen(this);
    return true;
  }

  /**
   * Draws the attack animation of a given type on the given terminal.
   *
   * @param term - The terminal to draw on.
   * @param type - The type of attack animation to draw. Must be one of 'longerSlash', 'shorterSlash', 'burst', or 'ranged'.
   */
  private drawAttackAnimation(
    term: DrawableTerminal,
    type: AttackAnimationType,
  ): void {
    const animation = AnimationManager.getAnimation(type);
    if (!animation) return;

    const { color, opacityFactor, thickness } = animation;
    const targetPos = this.getTargetPosition();
    const drawingMethod = this.getDrawingMethod(term, type);
    drawingMethod(targetPos.x, targetPos.y, color, opacityFactor, thickness);
  }

  /**
   * Returns the drawing method on the given terminal that corresponds to the
   * given type of attack animation.
   *
   * @param term - The terminal to draw on.
   * @param type - The type of attack animation to draw. Must be one of 'longerSlash', 'shorterSlash', 'burst', or 'ranged'.
   * @return The drawing method on the given terminal.
   */
  private getDrawingMethod(
    term: DrawableTerminal,
    type: AttackAnimationType,
  ): (
    x: number,
    y: number,
    color: string,
    opacityFactor: number,
    thickness: number,
  ) => void {
    switch (type) {
      case 'longerSlash':
        return term.drawLongerSlashAttackOverlay.bind(term);
      case 'shorterSlash':
        return term.drawShorterSlashAttackOverlay.bind(term);
      case 'ranged':
        return term.drawProjectileExplosion.bind(term);
      case 'burst':
        return term.drawBurstAttackOverlay.bind(term);
      default:
        return term.drawBurstAttackOverlay.bind(term);
    }
  }

  /**
   * Calculates the position of the target mob on the terminal based on its world position, taking into account the player's position.
   *
   * @return The position of the target mob on the terminal.
   */
  private getTargetPosition(): WorldPoint {
    const terminalCenter = new WorldPoint(
      Math.floor(this.gameConfig.terminal.dimensions.width * 0.5),
      Math.floor(this.gameConfig.terminal.dimensions.height * 0.5),
    );
    const playerPos = this.game.player.pos;

    return new WorldPoint(
      this.pos.x + (terminalCenter.x - playerPos.x),
      this.pos.y + (terminalCenter.y - playerPos.y),
    );
  }
}
