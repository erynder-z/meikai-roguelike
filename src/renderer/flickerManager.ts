import { gameConfigManager } from '../gameConfigManager/gameConfigManager';

/**
 * Utility class for managing the flicker effect on the main container.
 */
export class FlickerManager {
  /**
   * Toggles the flicker effect on the given container.
   *
   * If gameConfig.show_flicker is true, applies the flicker style.
   * Otherwise, removes any flicker styles from the container.
   *
   * @param container The element to which the flicker style should be applied.
   */
  public static handleFlicker(container: HTMLElement): void {
    const gameConfig = gameConfigManager.getConfig();
    if (gameConfig.show_flicker) {
      this.applyFlicker(container);
    } else {
      this.removeFlicker(container);
    }
  }

  /**
   * Applies a flicker style to the given container.
   *
   * @param container - The container to apply the flicker style to.
   */
  public static applyFlicker(container: HTMLElement): void {
    container.classList.add('flicker-effect');
  }

  /**
   * Removes flicker style from the given container.
   *
   * @param container - The container from which to remove the flicker style.
   */
  public static removeFlicker(container: HTMLElement): void {
    container.classList.remove('flicker-effect');
  }
}
