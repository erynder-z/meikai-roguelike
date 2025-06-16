type KeyHandler = (event: KeyboardEvent) => void;

const DEFAULT_DELAY_MS = 50;

/**
 * Throttles keyboard events. Intended to prevent rapid keypresses.
 */
export class KeypressThrottler {
  private isThrottled = false;
  private delay: number;
  private handler: KeyHandler;

  constructor(handler: KeyHandler, delay: number = DEFAULT_DELAY_MS) {
    this.handler = handler;
    this.delay = delay;
  }

  /**
   * Calls the handler with the given event, but only if the throttler is not
   * currently throttled. If the throttler is currently throttled, the call is
   * ignored. The throttler is set to true when the handler is called, and is
   * set back to false after `delay` milliseconds.
   *
   * @param {KeyboardEvent} event - The KeyboardEvent to pass to the handler.
   */
  public run(event: KeyboardEvent): void {
    if (this.isThrottled) return;

    this.isThrottled = true;
    this.handler(event);

    setTimeout(() => {
      this.isThrottled = false;
    }, this.delay);
  }
}
