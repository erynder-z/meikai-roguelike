import { GameState } from '../../gameBuilder/gameState';
import { SerializedGameState } from '../../utilities/saveStateHandler';
import { StackScreen } from '../../terminal/stackScreen';

export type ScreenMaker = {
  newGame(): StackScreen;
  loadGame(saveState: SerializedGameState): StackScreen;
  titleScreen(): void;
  gameOver(game: GameState): StackScreen;
  something(game: GameState | null): StackScreen;
};
