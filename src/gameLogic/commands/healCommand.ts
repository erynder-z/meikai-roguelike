import { CommandBase } from './commandBase';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameState } from '../../types/gameBuilder/gameState';
import { HealthAdjust } from './healthAdjust';
import { Mob } from '../mobs/mob';

/**
 * Represents a command to heal a mob.
 */
export class HealCommand extends CommandBase {
  constructor(
    private readonly healAmount: number,
    private readonly mob: Mob,
    private readonly gameInstance: GameState,
  ) {
    super(mob, gameInstance);
  }

  /**
   * Executes the heal command, healing the mob by a random amount between 50% and 75% of the specified heal amount.
   *
   * @return Returns true if the heal command was executed successfully.
   */
  public execute(): boolean {
    const randomGenerator = this.gameInstance.rand;
    const minHeal = Math.ceil(this.healAmount * 0.5);
    const maxHeal = Math.floor(this.healAmount * 1.5);
    const healPoints = randomGenerator.randomIntegerExclusive(minHeal, maxHeal);
    const isPlayer = this.mob.isPlayer;

    const s = isPlayer ? 'You heal' : `${this.mob.name} heals`;

    HealthAdjust.heal(this.mob, healPoints);

    const message = new LogMessage(
      `${s} ${healPoints} hp!`,
      EventCategory.heal,
    );
    this.gameInstance.message(message);

    return true;
  }
}
