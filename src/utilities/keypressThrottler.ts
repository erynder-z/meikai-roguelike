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

  public run(event: KeyboardEvent): void {
    if (this.isThrottled) return;

    this.isThrottled = true;
    this.handler(event);

    setTimeout(() => {
      this.isThrottled = false;
    }, this.delay);
  }
}
