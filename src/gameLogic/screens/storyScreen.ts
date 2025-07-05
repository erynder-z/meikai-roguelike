import { BaseScreen } from './baseScreen';
import { GameState } from '../../types/gameBuilder/gameState';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../types/terminal/stack';
import { StoryScreenDisplay } from '../../ui/storyScreenDisplay/storyScreenDisplay';

/**
 * Represents a screen for displaying additional content.
 */
export class StoryScreen extends BaseScreen {
  public name = 'StoryScreen';
  private display: StoryScreenDisplay | null = null;

  constructor(game: GameState, make: ScreenMaker) {
    super(game, make);
  }

  /**
   * Renders the story screen via a custom component.
   * If the display doesn't yet exist, it is created and
   * inserted into the document.
   * The display is then populated with the current level
   * and displayStoryText() is called to render the story text.
   */
  public drawScreen(): void {
    const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
    if (!this.display) {
      this.display = document.createElement(
        'story-screen-display',
      ) as StoryScreenDisplay;

      canvas?.insertAdjacentElement('afterend', this.display);

      const currentLevel = this.game.dungeon.level;

      this.display.displayStoryCard(currentLevel);
    }
  }

  /**
   * Handles key down events for the story screen.
   * If the menu key is pressed, the story screen fades out and is removed from the stack.
   * @param event - The keyboard event.
   * @param stack - The stack of screens.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): void {
    this.fadeOutStoryScreen();
    stack.pop();
  }

  /**
   * Fades out the story screen display and removes it from the DOM.
   *
   * @returns A promise that resolves when the fade out animation ends.
   */
  private async fadeOutStoryScreen(): Promise<void> {
    if (this.display) {
      await this.display.fadeOut();
      this.display.remove();
    }
  }
}
