import { BaseScreen } from './baseScreen';
import { DetailViewHandler } from '../../ui/detailVIewHandler/detailViewHandler';
import { GameState } from '../../types/gameBuilder/gameState';
import { ParsePlayer } from '../events/parsePlayer';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../types/terminal/stack';
import { StoryScreen } from './storyScreen';

/**
 * Represents a game screen that extends the functionality of the base screen.
 */
export class GameScreen extends BaseScreen {
  public name = 'game-screen';
  private detailViewHandler = new DetailViewHandler();
  constructor(game: GameState, make: ScreenMaker) {
    super(game, make);
  }

  /**
   * Handles key down events. If the entity card is open and the menu key is not being pressed,
   * the event is ignored. If the entity card is open and the menu key is being pressed, the
   * entity card is closed and the event is ignored. Otherwise, the event is passed to
   * {@link playerKeyTurn} to handle the player's turn.
   *
   * @param event - The keyboard event to handle.
   * @param stack - The current stack of screens.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): void {
    const isEntityCardOpen = this.detailViewHandler.isEntityCardOpen();
    const isMenuKey = event?.key === this.activeControlScheme.menu.toString();

    if (isEntityCardOpen && !isMenuKey) return;

    if (isEntityCardOpen && isMenuKey) {
      this.detailViewHandler.closeOpenEntityCard();
      return;
    }

    this.playerKeyTurn(
      stack,
      this.controlSchemeManager.keyPressToCode(event),
      event,
    );
  }

  /**
   * Handles the player's key turn. If the player's turn is successfully handled,
   * it calls {@link npcTurns} to handle the non-player character's turns.
   *
   * @param stack - The current stack of screens.
   * @param char - The character input.
   * @param event - The keyboard event associated with the key press, or null.
   */
  private playerKeyTurn(
    stack: Stack,
    char: string,
    event: KeyboardEvent | null,
  ): void {
    if (this.game.log) this.game.log.clearQueue();
    if (this.playerTurn(stack, char, event)) {
      this.npcTurns(stack);
      if (this.game.shouldShowStoryScreen) {
        stack.push(new StoryScreen(this.game, this.make));
        this.game.shouldShowStoryScreen = false;
      }
    }
  }

  /**
   * A function that handles the player's turn.
   *
   * @param stack - the stack object.
   * @param char - the character input.
   * @param event - the keyboard event or null.
   * @return The result of parsing the key code as a turn.
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