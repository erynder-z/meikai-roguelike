import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Command } from '../../shared-types/gameLogic/commands/command';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../shared-types/terminal/stack';
import { StackScreen } from '../../shared-types/terminal/stackScreen';
import { ItemObject } from '../itemObjects/itemObject';
import { MultipleUseItemCost } from '../itemObjects/multipleUseItemCost';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { Spell } from './spell';
import { SpellFinder } from './spellFinder';

/**
 * Helper-class that provides methods for returning a Command or a StackScreen for a item.
 */
export class FindObjectSpell {
  constructor(
    public obj: ItemObject,
    public index: number,
    public game: GameState,
    public stack: Stack,
    public make: ScreenMaker,
  ) {}

  /**
   * Checks if an ItemObject is usable. Objects that have no spell associated are not usable.
   *
   * @param obj - The ItemObject to check.
   * @param game - The Game instance.
   * @return True if the ItemObject is usable, false otherwise.
   */
  private isUsable(obj: ItemObject, game: GameState): boolean {
    const canUse = obj.spellCasting.spell != Spell.None;

    if (!canUse) {
      const msg = new LogMessage(
        `${obj.description()} is not usable!`,
        EventCategory.unable,
      );
      game.flash(msg);
    }
    return canUse;
  }

  /**
   * Finds a Command, StackScreen, or null based on the given ItemObject and Game.
   *
   * @return The found Command, StackScreen, or null if the ItemObject is not usable.
   */
  public find(): Command | StackScreen | null {
    const { game } = this;

    const obj: ItemObject = this.obj;

    if (!this.isUsable(obj, game)) return null;

    const finder = new SpellFinder(game, this.stack, this.make);
    const amount = obj.spellCasting.effectMagnitude || 1;
    const cost = new MultipleUseItemCost(game, obj, this.index);

    return finder.find(obj.spellCasting.spell, amount, cost);
  }
}
