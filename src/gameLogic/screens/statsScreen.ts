import { GameState } from '../../shared-types/gameBuilder/gameState';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../shared-types/terminal/stack';
import { StatsScreenDisplay } from '../../ui/statsScreenDisplay/statsScreenDisplay';
import { KeypressScrollHandler } from '../../utilities/KeypressScrollHandler';
import { BaseScreen } from './baseScreen';

/**
 * Represents a screen for displaying the player stats
 */
export class StatsScreen extends BaseScreen {
  public name: string = 'stats-screen';
  private display: StatsScreenDisplay | null = null;

  constructor(
    public game: GameState,
    public make: ScreenMaker,
  ) {
    super(game, make);
  }

  /**
   * Renders the stats screen via a custom component.
   */
  public drawScreen(): void {
    const canvas = document.getElementById(
      'terminal-canvas',
    ) as HTMLCanvasElement;
    if (!this.display) {
      this.display = document.createElement(
        'stats-screen-display',
      ) as StatsScreenDisplay;

      this.display.currentStats = this.game.stats;
      this.display.currentPlayer = this.game.player;
      if (this.game.equipment)
        this.display.currentEquipment = this.game.equipment;

      canvas?.insertAdjacentElement('afterend', this.display);

      this.display.displayHP();
      this.display.displayHunger();
      this.display.displayThirst();
      this.display.displayMaxCarryWeight();
      this.display.setBuffs(this.game.player.buffs.getBuffsMap());
    }
  }

  /**
   * Handles key down events and fades out the screen if the menu key is pressed.
   *
   * @param event - The keyboard event.
   * @param stack - The stack.
   * @return True if the event is handled, otherwise false.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): boolean {
    // fade out when menu key is pressed
    if (this.isMenuKeyPressed(event)) {
      this.fadeOutAndRemove(stack);
      return true;
    }
    // scroll via keypress when alt or meta key is pressed
    if (this.isAltKeyPressed(event)) {
      const scrollContainer = this.display?.shadowRoot?.querySelector(
        '.stats-screen-display',
      ) as HTMLElement;
      new KeypressScrollHandler(scrollContainer).handleVirtualScroll(event);
      return true;
    }
    return false;
  }

  /**
   * Checks if the menu key is pressed.
   *
   * @param event - The keyboard event.
   * @return True if the menu key is pressed, otherwise false.
   */
  private isMenuKeyPressed(event: KeyboardEvent): boolean {
    return event.key === this.activeControlScheme.menu.toString();
  }

  /**
   * Checks if the Alt or Meta key is pressed.
   *
   * @param event - The keyboard event.
   * @return True if the Alt or Meta key is pressed, otherwise false.
   */
  private isAltKeyPressed(event: KeyboardEvent): boolean {
    return event.altKey || event.metaKey;
  }

  /**
   * Fades out the log screen display and removes it from the DOM. Then it pops the current screen from the stack.
   *
   * @param stack - The stack of screens.
   * @return A promise that resolves when the fade out animation ends.
   */
  private async fadeOutAndRemove(stack: Stack): Promise<void> {
    if (this.display) {
      await this.display.fadeOut();

      stack.pop();
    }
  }
}
