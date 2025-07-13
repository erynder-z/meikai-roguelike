import { DrawableTerminal } from '../types/terminal/drawableTerminal';
import { InteractiveScreen } from '../types/terminal/interactiveScreen';
import { Stack } from '../types/terminal/stack';
import { StackScreen } from '../types/terminal/stackScreen';

/**
 * Represents a stack of interactive screens in the game.
 * Each screen in the stack is capable of drawing on the terminal and handling keyboard events.
 */
export class ScreenStack implements Stack, InteractiveScreen {
  public name: string = 'stack';
  public screens: StackScreen[] = [];
  /**
   * Remove and return the last element from the currentScreen array.
   */
  public pop() {
    /* if (this.screens.length > 0) this.fadeOutAndRemoveScreen(); */

    return this.screens.pop();
  }
  /**
   * Push a new screen onto the stack.
   *
   * @param screen - the screen to push onto the stack.
   */
  public push(screen: StackScreen) {
    this.screens.push(screen);
  }
  /**
   * Get the current screen.
   *
   * @return The current screen.
   */
  public getCurrentScreen(): StackScreen {
    return this.screens[this.screens.length - 1];
  }

  /**
   * Removes a screen from the stack.
   *
   * @param screen - the screen to be removed.
   */
  public removeScreen(screen: StackScreen): void {
    const index = this.screens.indexOf(screen);
    if (index !== -1) {
      this.screens.splice(index, 1);
    }
  }

  /**
   * Clears all screens from the stack.
   */
  public removeAllScreens(): void {
    this.screens = [];
  }

  /**
   * Draws the current screen on the terminal, if there is one.
   *
   * @param term - the screen to be drawn.
   */
  public drawScreen(term: DrawableTerminal) {
    const currentScreen = this.getCurrentScreen();
    if (currentScreen) {
      currentScreen.drawScreen(term);
    }
  }

  // TODO: Get the actual UI elements associated with the current screen and fade them out.
  //       Below will not work, because it targets the stack screens, not the UI elements.
  //
  private fadeOutAndRemoveScreen(): void {
    const screen = this.getCurrentScreen();
    if (!screen) return;

    const currentScreenElement = document.querySelector(screen.name);

    if (currentScreenElement) {
      currentScreenElement.classList.add('fade-out');
      currentScreenElement.addEventListener(
        'animationend',
        () => currentScreenElement.remove(),
        { once: true },
      );
    } else {
      const displayElement = document.querySelector(`${screen.name}-display`);
      if (displayElement) {
        displayElement.classList.add('fade-out');
        displayElement.addEventListener(
          'animationend',
          () => displayElement.remove(),
          { once: true },
        );
      }
    }
  }

  /**
   * Handle key down event.
   *
   * @param event - The keyboard event to handle.
   */
  public handleKeyDownEvent(event: KeyboardEvent) {
    const currentScreen = this.getCurrentScreen();
    if (currentScreen) {
      currentScreen.handleKeyDownEvent(event, this);
    }
  }

  /**
   * A method that determines if the screen should be updated based on time.
   *
   * @return Returns `true` if the screen should be updated, `false` otherwise.
   */
  public onTime(): boolean {
    let change = false;
    const s = this.getCurrentScreen();
    if (s) change = s.onTime(this);
    return change;
  }
}
