import { Command } from '../../shared-types/gameLogic/commands/command';
import { CommandBase } from './commandBase';
import { DamageStep } from '../stepper/damageStep';
import { DirectionStep } from '../stepper/directionStep';
import { EventCategory } from '../messages/logMessage';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Glyph } from '../glyphs/glyph';
import { ImageHandler } from '../../media/imageHandler/imageHandler';
import { Mob } from '../mobs/mob';
import { RangedWeaponType } from '../stepper/damageStep';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { Step } from '../../shared-types/gameLogic/stepper/step';
import { StepScreen } from '../screens/stepScreen';
import { Stack } from '../../shared-types/terminal/stack';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Represents a command to fire a ranged weapon.
 */
export class BulletCommand extends CommandBase {
  constructor(
    public me: Mob,
    public game: GameState,
    public stack: Stack,
    public make: ScreenMaker,
    public direction: WorldPoint = new WorldPoint(),
  ) {
    super(me, game);
  }

  /**
   * Sets the direction for the command.
   *
   * @param direction - The direction to set.
   * @return The command object.
   */
  public setDirection(direction: WorldPoint): Command {
    this.direction = direction;
    return this;
  }

  /**
   * Executes the bullet command..
   *
   * @return The result of the function execution.
   */
  public execute(): boolean {
    const { game, me } = this;

    const dmg = 4;
    const type = RangedWeaponType.Pistol;
    const sprite = Glyph.Bullet;
    const effect = null;
    const next = new DamageStep(dmg, type, me, game);
    const step: Step = new DirectionStep(
      effect,
      next,
      sprite,
      me.pos.copy(),
      game,
    );

    step.setDirection(this.direction);
    this.stack.push(new StepScreen(game, this.make, step));

    if (me.isPlayer) {
      this.game.addCurrentEvent(EventCategory.rangedAttack);
      const imageHandler = ImageHandler.getInstance();

      imageHandler.handlePistolImageDisplay(game);
    }

    return false;
  }
}
