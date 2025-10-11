import { GameMap } from '../../maps/mapModel/gameMap';
import { DrawUI } from '../../renderer/drawUI';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { DrawableTerminal } from '../../shared-types/terminal/drawableTerminal';
import { Stack } from '../../shared-types/terminal/stack';
import { BaseScreen } from './baseScreen';

export class DebuggerScreen extends BaseScreen {
  public name = 'debugger-screen';

  constructor(game: GameState, make: ScreenMaker) {
    super(game, make);
  }

  /**
   * Draws the game screen for the debugger.
   *
   * @param term - the terminal to draw on
   */
  public drawScreen(term: DrawableTerminal): void {
    DrawUI.debugDrawMap(
      term,
      <GameMap>this.game.currentMap(),
      this.game.player.pos,
    );
  }

  /**
   * Handles key down events, specifically checking for the debug key.
   * If the debug key is pressed, the screen is popped from the stack.
   *
   * @param event - The keyboard event to handle.
   * @param stack - The stack of screens.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): void {
    switch (event.key) {
      case this.activeControlScheme.debug1.toString():
        stack.pop();
        break;
    }
  }
}
