import { GameState } from '../../shared-types/gameBuilder/gameState';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../shared-types/terminal/stack';
import { Buff } from '../buffs/buffEnum';
import { EventCategory } from '../messages/logMessage';
import { Mob } from '../mobs/mob';
import { CommandBase } from './commandBase';
import { MoveBumpCommand } from './moveBumpCommand';

/**
 * Represents a wait command that ends the turn for the mob.
 */
export class WaitCommand extends CommandBase {
  constructor(
    public me: Mob,
    public game: GameState,
    public stack: Stack,
    public make: ScreenMaker,
  ) {
    super(me, game);
  }
  /**
   * Executes the wait command.
   *
   * @returns Always returns true.
   */
  public execute(): boolean {
    const { me, game } = this;
    const isConfused = me.is(Buff.Confuse);

    if (isConfused) {
      const randomDirection = game.rand.randomDirectionForcedMovement();
      return new MoveBumpCommand(
        randomDirection,
        me,
        game,
        this.stack,
        this.make,
      ).execute();
    }

    game.addCurrentEvent(EventCategory.wait);

    return !isConfused;
  }
}
