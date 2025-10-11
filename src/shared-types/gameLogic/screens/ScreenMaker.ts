import { GameState } from '../../gameBuilder/gameState';
import { StackScreen } from '../../terminal/stackScreen';
import { SerializedGameState } from '../../utilities/saveStateHandler';

export type ScreenMaker = {
  newGame(): StackScreen;
  loadGame(saveState: SerializedGameState): StackScreen;
  titleScreen(): void;
  gameOver(game: GameState): StackScreen;
  something(game: GameState | null): StackScreen;
};
