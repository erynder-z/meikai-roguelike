import { GameState } from '../../shared-types/gameBuilder/gameState';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { Step } from '../../shared-types/gameLogic/stepper/step';
import { DrawableTerminal } from '../../shared-types/terminal/drawableTerminal';
import { Stack } from '../../shared-types/terminal/stack';
import { DamageStep } from '../stepper/damageStep';
import { AttackAnimationScreen } from './attackAnimationScreen';
import { BaseScreen } from './baseScreen';

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
  public handleKeyDownEvent(_event: KeyboardEvent, _stack: Stack): boolean {
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
