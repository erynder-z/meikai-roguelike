import { BaseScreen } from './baseScreen';
import { Command } from '../../types/gameLogic/commands/command';
import { CommandBase } from '../commands/commandBase';
import { Cost } from '../../types/gameLogic/commands/cost';
import { GameState } from '../../types/gameBuilder/gameState';
import keys from '../../utilities/commonKeyboardChars.json';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Spell } from '../spells/spell';
import { SpellFinder } from '../spells/spellFinder';
import { Stack } from '../../types/terminal/stack';
import { StackScreen } from '../../types/terminal/stackScreen';
import { SpellScreenDisplay } from '../../ui/spellScreenDisplay/spellScreenDisplay';

/**
 * Represents a screen for choosing spells.
 */
export class SpellScreen extends BaseScreen {
  public name = 'spell-screen';
  private display: SpellScreenDisplay | null = null;
  constructor(
    public game: GameState,
    public make: ScreenMaker,
  ) {
    super(game, make);
  }
  /**
   * Converts a position to a corresponding character.
   *
   * @param pos - The position to convert.
   * @return The corresponding character.
   */
  private positionToCharacter(pos: number): string {
    return keys.keys[pos];
  }

  /**
   * Converts a character to a corresponding position in the spell list.
   * The character is converted to a number by finding its index in the list of keys.
   * If the character is not found, -1 is returned.
   *
   * @param c - The character to convert.
   * @return The position of the character in the list of keys, or -1 if not found.
   */
  private characterToPosition(c: string): number {
    const pos = keys.keys.indexOf(c);
    return pos >= 0 ? pos : -1;
  }

  /**
   * Draws the spell selection screen by creating and appending a 'spell-screen-display' element
   * to the 'canvas-container' element. Populates the display with a list of spells and sets
   * the title to 'Select spell:'.
   */
  public drawScreen(): void {
    const canvas = document.getElementById(
      'terminal-canvas',
    ) as HTMLCanvasElement;
    if (!this.display) {
      this.display = document.createElement(
        'spell-screen-display',
      ) as SpellScreenDisplay;

      const spells = Array.from({ length: Spell.None }, (_, i) => ({
        key: this.positionToCharacter(i),
        description: Spell[i],
      }));

      this.display.spells = spells;
      this.display.title = 'Select spell:';

      canvas?.insertAdjacentElement('afterend', this.display);
    }
  }

  /**
   * Handles key down events.
   *
   * @param event - The keyboard event.
   * @param stack - The stack of screens.
   * @return True if the event was handled successfully, otherwise false.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): boolean {
    const key = event.key;

    if (this.isSpellKey(key)) {
      const pos = this.characterToPosition(key);
      this.handleSpellSelection(pos, stack);
      return true;
    }

    if (key === this.activeControlScheme.menu.toString()) {
      this.handleCancel(stack);
      return true;
    }

    return false;
  }

  /**
   * Checks if the key corresponds to a valid spell.
   *
   * @param key - The pressed key.
   * @return True if the key is a valid spell key.
   */
  private isSpellKey(key: string): boolean {
    const pos = this.characterToPosition(key);
    return pos >= 0 && pos < Spell.None && !!Spell[pos];
  }

  /**
   * Handles the selection of a spell.
   *
   * @param pos - The position of the selected spell.
   * @param stack - The stack object.
   */
  private handleSpellSelection(pos: number, stack: Stack): void {
    /*  this.game.log.clearQueue(); */
    this.closeScreen(stack);
    this.itemMenu(pos, stack);
  }

  /**
   * Handles the cancellation of the spell screen.
   *
   * @param stack - The stack object.
   */
  private handleCancel(stack: Stack): void {
    this.closeScreen(stack);
  }

  /**
   * Closes the spell screen with fade-out animation and removes it from the stack.
   *
   * @param stack - The stack object.
   */
  private closeScreen(stack: Stack): void {
    this.fadeOutSpellScreen();
    stack.pop();
  }

  /**
   * Handles the item menu selection.
   *
   * @param pos - The position of the selected item.
   * @param stack - The stack object.
   */
  private itemMenu(pos: number, stack: Stack): void {
    const s: Spell = pos;
    const label = Spell[s];

    if (!label) return;

    this.doSpell(s, stack);
  }

  /**
   * Executes a spell by finding the corresponding command or screen and pushing it onto the stack.
   *
   * @param s - The spell to be executed.
   * @param stack - The stack object.
   */
  private doSpell(s: Spell, stack: Stack): void {
    const finder = new SpellFinder(this.game, stack, this.make);
    const amount = 1;
    const cost: Cost | undefined = undefined;
    const spell: Command | StackScreen | null = finder.find(s, amount, cost);

    if (spell == null) return;
    if (spell instanceof CommandBase) {
      if (spell.turn()) this.npcTurns(stack);
    } else {
      stack.push(<StackScreen>spell);
    }
  }

  /**
   * Fades out the spell screen display and removes it from the DOM.
   *
   * @return A promise that resolves when the fade out animation ends.
   */
  private async fadeOutSpellScreen(): Promise<void> {
    if (this.display) {
      await this.display.fadeOut();
    }
  }
}
