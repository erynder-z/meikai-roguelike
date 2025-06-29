export class FlickerManager {
  private static instance: FlickerManager;
  private canvas: HTMLCanvasElement | null;
  private flickerTimeoutId: number | null = null;
  private isRunning: boolean = false;

  private constructor() {
    this.canvas = document.getElementById('canvas1') as HTMLCanvasElement;
  }

  /**
   * Gets the single instance of the FlickerManager.
   *
   * Ensures that only one instance of the FlickerManager is created (singleton pattern).
   * If the instance does not exist, it is created. Otherwise, the existing instance is returned.
   *
   * @returns The single instance of the FlickerManager.
   */

  public static getInstance(): FlickerManager {
    if (!FlickerManager.instance) {
      FlickerManager.instance = new FlickerManager();
    }
    return FlickerManager.instance;
  }

  /**
   * Starts the flicker effect.
   *
   * Removes any existing flicker classes from the canvas element and randomly selects a new one to apply.
   * Sets a timeout for the next flicker effect, with a random delay between 50 and 400 milliseconds.
   */
  private setFlicker = (): void => {
    if (!this.canvas) return;

    this.canvas.classList.remove(
      'flicker-fast',
      'flicker-medium',
      'flicker-slow',
    );

    const random = Math.random();
    let nextDelay = 500;

    if (random < 0.33) {
      this.canvas.classList.add('flicker-fast');
      nextDelay = 50 + Math.random() * 100;
    } else if (random < 0.66) {
      this.canvas.classList.add('flicker-medium');
      nextDelay = 100 + Math.random() * 200;
    } else {
      this.canvas.classList.add('flicker-slow');
      nextDelay = 200 + Math.random() * 300;
    }

    this.flickerTimeoutId = window.setTimeout(this.setFlicker, nextDelay);
  };

  /**
   * Starts the flicker effect.
   *
   * Checks if the canvas element and the FlickerManager instance exist, and if the flicker effect is not already running.
   * If all conditions are met, it calls the setFlicker method to start the effect and sets the isRunning flag to true.
   */
  public start(): void {
    if (!this.canvas || this.isRunning) return;
    this.setFlicker();
    this.isRunning = true;
  }

  /**
   * Stops the flicker effect.
   *
   * Clears the timeout for the next flicker animation and removes the flicker class from the canvas element.
   * Also sets the isRunning flag to false.
   */
  public stop(): void {
    if (this.flickerTimeoutId) {
      clearTimeout(this.flickerTimeoutId);
      this.flickerTimeoutId = null;
    }
    if (this.canvas) {
      this.canvas.classList.remove(
        'flicker-fast',
        'flicker-medium',
        'flicker-slow',
      );
    }
    this.isRunning = false;
  }

  /**
   * Gets whether the flicker effect is currently running.
   *
   * @return true if the flicker effect is running, false otherwise.
   */
  public getIsRunning(): boolean {
    return this.isRunning;
  }
}
