import { Buff } from '../buffs/buffEnum';
import { CommandBase } from './commandBase';
import { EventCategory } from '../messages/logMessage';
import { GameState } from '../../types/gameBuilder/gameState';
import { Mob } from '../mobs/mob';
import { MoveBumpCommand } from './moveBumpCommand';
import { Stack } from '../../types/terminal/stack';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';

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
