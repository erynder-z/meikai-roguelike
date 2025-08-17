import { Cost } from '../../types/gameLogic/commands/cost';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameState } from '../../types/gameBuilder/gameState';
import { ItemObject } from './itemObject';

/**
 * Represents the cost for a multiple-use item.
 */
export class MultipleUseItemCost implements Cost {
  constructor(
    public game: GameState,
    public obj: ItemObject,
    public objectIndex: number,
  ) {}

  /**
   * Pay the cost of using a multiple-use item.
   *
   * @return True if the cost was successfully paid, false otherwise.
   */
  public pay(): boolean {
    const { obj } = this;

    if (obj.spellCasting.charges <= 0) {
      const msg = new LogMessage(
        `${obj.description()} is out of charges!`,
        EventCategory.unable,
      );
      this.game.message(msg);
    } else {
      --obj.spellCasting.charges;
      if (obj.spellCasting.charges > 0) return true;
      const msg = new LogMessage(
        `${obj.description()} is out of charges!`,
        EventCategory.use,
      );

      this.game.message(msg);
    }
    this.game.inventory!.removeIndex(this.objectIndex);
    return true;
  }
}
