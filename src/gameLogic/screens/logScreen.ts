import { BaseScreen } from './baseScreen';
import { GameState } from '../../types/gameBuilder/gameState';
import { KeypressScrollHandler } from '../../utilities/KeypressScrollHandler';
import { LogMessage } from '../messages/logMessage';
import { LogScreenDisplay } from '../../ui/logScreenDisplay/logScreenDisplay';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../types/terminal/stack';

/**
 * Represents a screen for displaying the log messages.
 */
export class LogScreen extends BaseScreen {
  public name: string = 'log-screen';
  private display: LogScreenDisplay | null = null;

  constructor(
    public game: GameState,
    public make: ScreenMaker,
    private messageLog: LogMessage[] = game.log.archive,
  ) {
    super(game, make);
  }

  /**
   * Renders the log screen via a custom component.
   */
  public drawScreen(): void {
    const canvas = document.getElementById(
      'terminal-canvas',
    ) as HTMLCanvasElement;
    if (!this.display) {
      this.display = document.createElement(
        'log-screen-display',
      ) as LogScreenDisplay;
      canvas?.insertAdjacentElement('afterend', this.display);
    }
    this.display.log = this.messageLog;
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
        '.log-screen-display',
      ) as HTMLElement;
      new KeypressScrollHandler(scrollContainer).handleVirtualScroll(event);
      return true;
    }
    return false;
  }

  /**
   * Checks if the menu key is pressed.#
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
   * @param  event - The keyboard event.
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
