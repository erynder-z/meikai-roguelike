import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { InteractiveScreen } from '../../types/terminal/interactiveScreen';
import { KeypressThrottler } from '../../utilities/keypressThrottler';
import { ResizingTerminal } from '../../terminal/resizingTerminal';

/**
 * Manages events such as keyboard input and window resizing.
 *
 */
export class EventManager {
  private keyThrottler: KeypressThrottler;

  constructor(
    public term: ResizingTerminal,
    public screen: InteractiveScreen,
  ) {
    const gameConfig = gameConfigManager.getConfig();
    const { min_keypress_delay } = gameConfig;

    this.keyThrottler = new KeypressThrottler(
      this.handleKeyDown.bind(this),
      min_keypress_delay,
    );

    const bodyElement = document.getElementById('body-main');
    bodyElement?.addEventListener('keydown', event =>
      this.keyThrottler.run(event),
    );

    window.addEventListener('resize', this.handleResize.bind(this));
    this.handleResize();
    this.initTimer();
  }

  /**
   * Handles the window resize event by adjusting the resizing terminal and updating the raw screen.
   *
   */
  public handleResize(): void {
    this.term.handleResize();
    this.screen.drawScreen(this.term);
  }

  /**
   * Handles a font change event by updating the terminal font.
   *
   * The EventManager listens for a font change event and updates the terminal font when the event is triggered.
   */
  public handleFontChange(): void {
    this.term.updateFont();
    this.screen.drawScreen(this.term);
  }
  /**
   * Handles the keyboard input event by updating the raw screen based on the input.
   *
   * @param {KeyboardEvent} event - The keyboard event to be handled.
   */
  private handleKeyDown(event: KeyboardEvent): void {
    this.screen.handleKeyDownEvent(event);
    this.screen.drawScreen(this.term);
  }

  /**
   * Initializes a timer that calls the onTimer method at a specified interval.
   *
   * @return {void} No return value.
   */
  private initTimer(): void {
    const interval_ms = 50;
    setInterval(this.onTimer.bind(this), interval_ms);
  }

  /**
   * Executes the onTime method of the screen and redraws the screen if there is a change.
   *
   */
  private onTimer() {
    const change: boolean = this.screen.onTime();
    if (change) {
      this.screen.drawScreen(this.term);
    }
  }

  /**
   * Creates and runs an EventManager instance with a provided raw screen interface.
   *
   * @param {RawScreenInterface} rawScreen - The raw screen interface to be associated with the manager.
   * @returns The created EventManager instance.
   */
  public static runWithInteractiveScreen(
    rawScreen: InteractiveScreen,
  ): EventManager {
    return new EventManager(new ResizingTerminal(), rawScreen);
  }
}
