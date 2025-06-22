import { Command } from '../../types/gameLogic/commands/command';
import { CommandBase } from './commandBase';
import { DirectionStep } from '../stepper/directionStep';
import { GameState } from '../../types/gameBuilder/gameState';
import { Glyph } from '../glyphs/glyph';
import { Mob } from '../mobs/mob';
import { PayloadStep } from '../stepper/payloadStep';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Step } from '../../types/gameLogic/stepper/step';
import { StepScreen } from '../screens/stepScreen';
import { Stack } from '../../types/terminal/stack';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Represents a command fires a given payload in a specified direction.
 */
export class PayloadCommand extends CommandBase {
  constructor(
    public me: Mob,
    public game: GameState,
    public stack: Stack,
    public make: ScreenMaker,
    public payload: Command,
    public dir: WorldPoint = new WorldPoint(),
  ) {
    super(me, game);
  }

  /**
   * Sets the direction of the command.
   *
   * @param direction - The direction to set.
   * @return The command object.
   */
  public setDirection(direction: WorldPoint): Command {
    this.dir = direction;
    return this;
  }

  /**
   * Executes the command by creating a new PayloadStep, setting its direction, and pushing a new StepScreen onto the stack.
   *
   * @return Always returns false.
   */
  public execute(): boolean {
    const { game, me } = this;

    const sprite = Glyph.Bullet;
    const effect = null;
    const next = new PayloadStep(me, game, this.payload);
    const step: Step = new DirectionStep(
      effect,
      next,
      sprite,
      me.pos.copy(),
      game,
    );
    step.setDirection(this.dir);
    this.stack.push(new StepScreen(game, this.make, step));
    return false;
  }
}
