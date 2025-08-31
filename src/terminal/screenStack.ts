import { DrawableTerminal } from '../shared-types/terminal/drawableTerminal';
import { InteractiveScreen } from '../shared-types/terminal/interactiveScreen';
import { Stack } from '../shared-types/terminal/stack';
import { StackScreen } from '../shared-types/terminal/stackScreen';

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
