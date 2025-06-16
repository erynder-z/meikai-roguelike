import { BaseScreen } from './baseScreen';
import { GameState } from '../../types/gameBuilder/gameState';
import { ParsePlayer } from '../events/parsePlayer';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../types/terminal/stack';
import { DetailViewHandler } from '../../ui/detailVIewHandler/detailViewHandler';

/**
 * Represents a game screen that extends the functionality of the base screen.
 */
export class GameScreen extends BaseScreen {
  public name = 'game-screen';
  constructor(game: GameState, make: ScreenMaker) {
    super(game, make);
  }

  /**
   * Handle key down event.
   *
   * @param {KeyboardEvent} event - the keyboard event
   * @param {Stack} stack - the stack
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): void {
    const detailViewHandler = new DetailViewHandler();
    const isEntityCardOpen = detailViewHandler.isEntityCardOpen();
    if (isEntityCardOpen) detailViewHandler.closeOpenEntityCard();

    this.playerKeyTurn(
      stack,
      this.controlSchemeManager.keyPressToCode(event),
      event,
    );
  }

  /**
   * A function that handles the player's turn in the game.
   *
   * @param {Stack} stack - the game stack
   * @param {string} char - the character input by the player
   * @param {KeyboardEvent | null} event - the keyboard event or null
   */
  private playerKeyTurn(
    stack: Stack,
    char: string,
    event: KeyboardEvent | null,
  ): void {
    if (this.game.log) this.game.log.clearQueue();
    if (this.playerTurn(stack, char, event)) this.npcTurns(stack);
  }

  /**
   * A function that handles the player's turn.
   *
   * @param {Stack} stack - the stack object
   * @param {string} char - the character input
   * @param {KeyboardEvent | null} event - the keyboard event or null
   * @return {boolean} the result of parsing the key code as a turn
   */
  private playerTurn(
    stack: Stack,
    char: string,
    event: KeyboardEvent | null,
  ): boolean {
    const parser = new ParsePlayer(this.game, this.make);
    return parser.parseKeyCodeAsTurn(char, stack, event);
  }
}
