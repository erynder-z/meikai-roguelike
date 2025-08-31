import { BaseScreen } from './baseScreen';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../shared-types/terminal/stack';

/**
 * Represents a screen for displaying additional content.
 */
export class SomeScreen extends BaseScreen {
  public name = 'SomeScreen';

  constructor(game: GameState, make: ScreenMaker) {
    super(game, make);
  }

  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): void {}
}
