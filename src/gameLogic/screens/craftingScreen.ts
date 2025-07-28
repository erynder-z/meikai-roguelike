import { BaseScreen } from './baseScreen';
import { CraftingScreenDisplay } from '../../ui/craftingScreenDisplay/craftingScreenDisplay';
import { GameState } from '../../types/gameBuilder/gameState';
import { Inventory } from '../inventory/inventory';
import { KeypressScrollHandler } from '../../utilities/KeypressScrollHandler';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../types/terminal/stack';

/**
 * Represents the screen for the crafting menu.
 */
export class CraftingScreen extends BaseScreen {
  public name = 'crafting-screen';
  private display: CraftingScreenDisplay | null = null;
  constructor(
    public game: GameState,
    public make: ScreenMaker,
    private inventory: Inventory = <Inventory>game.inventory,
  ) {
    super(game, make);
  }

  /**
   * Renders the crafting screen display via a custom component.
   */
  public drawScreen(): void {
    const canvas = document.getElementById(
      'terminal-canvas',
    ) as HTMLCanvasElement;
    if (!this.display) {
      this.display = document.createElement(
        'crafting-screen-display',
      ) as CraftingScreenDisplay;
      canvas?.insertAdjacentElement('afterend', this.display);
      this.display.items = this.inventory.items;
    }
  }

  /**
   * Fades out the crafting screen.
   *
   * @return A promise that resolves when the fade out animation ends.
   */
  private async fadeOutInventoryScreen(): Promise<void> {
    if (this.display) {
      await this.display.fadeOut();
    }
  }

  /**
   * Handles key down events in the crafting screen.
   *
   * @param event - The keyboard event.
   * @param stack - The stack of screens.
   * @return True if the event was handled, otherwise false.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): boolean {
    if (event.key === this.activeControlScheme.menu.toString()) {
      this.fadeOutInventoryScreen();
      stack.pop();
      return true;
    }

    // scroll via keypress when alt or meta key is pressed
    if (this.isAltKeyPressed(event)) {
      const scrollContainer = this.display?.shadowRoot?.querySelector(
        '.crafting-screen-display',
      ) as HTMLElement;
      new KeypressScrollHandler(scrollContainer).handleVirtualScroll(event);
      return true;
    }
    return false;
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
}
