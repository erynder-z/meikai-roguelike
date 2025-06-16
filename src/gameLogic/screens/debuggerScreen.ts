import { BaseScreen } from './baseScreen';
import { DrawableTerminal } from '../../types/terminal/drawableTerminal';
import { DrawUI } from '../../renderer/drawUI';
import { GameMap } from '../../maps/mapModel/gameMap';
import { GameState } from '../../types/gameBuilder/gameState';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../types/terminal/stack';

export class DebuggerScreen extends BaseScreen {
  public name = 'debugger-screen';

  constructor(game: GameState, make: ScreenMaker) {
    super(game, make);
  }

  /**
   * Draws the game screen for the debugger.
   *
   * @param {DrawableTerminal} term - the terminal to draw on
   */
  public drawScreen(term: DrawableTerminal): void {
    DrawUI.debugDrawMap(
      term,
      <GameMap>this.game.currentMap(),
      this.game.player.pos,
    );
  }

  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): void {
    switch (event.key) {
      case this.activeControlScheme.debug1.toString():
        stack.pop();
        break;
    }
  }
}
