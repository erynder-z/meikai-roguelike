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

  public drawScreen(): void {
    const canvas = document.getElementById('canvas1') as HTMLCanvasElement;
    if (!this.display) {
      this.display = document.createElement(
        'story-screen-display',
      ) as StoryScreenDisplay;

      canvas?.insertAdjacentElement('afterend', this.display);
    }
  }

  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): void {
    this.fadeOutStoryScreen();
    stack.pop();
  }

  private async fadeOutStoryScreen(): Promise<void> {
    if (this.display) {
      await this.display.fadeOut();
      this.display.remove();
    }
  }
}
