import { AttackAnimationScreen } from './attackAnimationScreen';
import { BaseScreen } from './baseScreen';
import { DamageStep } from '../stepper/damageStep';
import { DrawableTerminal } from '../../types/terminal/drawableTerminal';
import { GameState } from '../../types/gameBuilder/gameState';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../types/terminal/stack';
import { Step } from '../../types/gameLogic/stepper/step';

/**
 * Represents a screen that displays a timed step that damages a mob at its current position.
 */
export class StepScreen extends BaseScreen {
  public name = 'step-screen';
  constructor(
    public game: GameState,
    public make: ScreenMaker,
    public step: Step | null,
  ) {
    super(game, make);
  }

  /**
   * Handles the key down event.
   *
   * @param event - The keyboard event.
   * @param  stack - The stack.
   * @return True if the event was handled successfully, false otherwise.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): boolean {
    return false;
  }

  /**
   * Draws the screen on the provided drawable terminal.
   *
   * @param term - The terminal on which to draw the screen.
   */
  public drawScreen(term: DrawableTerminal): void {
    super.drawScreen(term);
  }

  /**
   * Handles the timed step screen.
   *
   * @param stack - The stack of screens.
   * @return True if the screen should be updated, false otherwise.
   */
  public onTime(stack: Stack): boolean {
    if (this.step == null) throw 'step is null';

    const currentStep = this.step.executeStep();
    this.step = currentStep;

    if (currentStep instanceof DamageStep) {
      const pos = currentStep.pos;
      const isAttackByPlayer = currentStep.actor.isPlayer;
      const isDig = false;
      const isRanged = true;
      if (pos)
        stack.push(
          new AttackAnimationScreen(
            this.game,
            this.make,
            pos,
            isAttackByPlayer,
            isDig,
            isRanged,
          ),
        );
    }

    if (this.step) return true;

    this.pop_and_runNPCLoop(stack);

    return true;
  }
}
