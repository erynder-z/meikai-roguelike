import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { InteractiveScreen } from '../../shared-types/terminal/interactiveScreen';
import { Terminal } from '../../terminal/terminal';

/**
 * Manages events such as keyboard input and window resizing.
 *
 */
export class EventManager {
  private isThrottled = false;

  constructor(
    public term: Terminal,
    public screen: InteractiveScreen,
  ) {
    const bodyElement = document.getElementById('body-main');
    bodyElement?.addEventListener('keydown', event =>
      this.throttleKeyboardInput(event),
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
   * @param event - The keyboard event to be handled.
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' || event?.metaKey) event.preventDefault();
    this.screen.handleKeyDownEvent(event);
    this.screen.drawScreen(this.term);
  }

  /**
   * Initializes a timer that calls the onTimer method at a specified interval.
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
   * @param rawScreen - The raw screen interface to be associated with the manager.
   * @returns The created EventManager instance.
   */
  public static runWithInteractiveScreen(
    rawScreen: InteractiveScreen,
  ): EventManager {
    return new EventManager(new Terminal(), rawScreen);
  }

  /**
   * Handles keyboard events with a throttle to prevent rapid successive inputs.
   *
   * @param event - The keyboard event to be processed.
   *
   * This method limits the rate of processing keyboard events by setting a throttle
   * that temporarily prevents additional events from being processed. It processes
   * the event immediately and then waits for a delay, defined by the game configuration,
   * before allowing the next event to be processed.
   */
  private throttleKeyboardInput(event: KeyboardEvent): void {
    if (this.isThrottled) return;

    this.isThrottled = true;
    this.handleKeyDown(event);

    setTimeout(() => {
      this.isThrottled = false;
    }, gameConfigManager.getConfig().min_keypress_delay);
  }
}
