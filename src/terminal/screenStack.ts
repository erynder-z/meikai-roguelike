import { EventManager } from '../gameLogic/events/eventManager';
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
   * Remove and return the last element from the currentScreen array, as well as remove the screen from the DOM.
   */
  public pop() {
    this.fadeOutAndRemoveScreen();
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
   * Removes the current screen by fading it out and then removing it from the DOM.
   * This function is called when popping the current screen from the stack.
   */
  private fadeOutAndRemoveScreen(): void {
    const currentScreenElement = document.getElementById(
      this.getCurrentScreen().name,
    );
    if (currentScreenElement) {
      currentScreenElement.classList.add('animate__fadeOut');
      currentScreenElement.addEventListener(
        'animationend',
        () => currentScreenElement.remove(),
        { once: true },
      );
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

  /**
   * Runs the StackScreen by pushing it onto the ScreenStack and running it with the EventManager.
   *
   * @param sScreen - the StackScreen to be run.
   */
  public static run_StackScreen(sScreen: StackScreen): void {
    const stack = new ScreenStack();
    stack.push(sScreen);
    EventManager.runWithInteractiveScreen(stack);
  }
}
