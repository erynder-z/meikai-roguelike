import { Build } from '../../shared-types/gameBuilder/build';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { StackScreen } from '../../shared-types/terminal/stackScreen';
import { SerializedGameState } from '../../shared-types/utilities/saveStateHandler';
import { ScreenStack } from '../../terminal/screenStack';
import { GenerateTitleScreen } from '../../ui/uiGenerators/generateTitleScreen';
import { EventManager } from '../events/eventManager';
import { GameOverScreen } from './gameOverScreen';
import { GameScreen } from './gameScreen';
import { SomeScreen } from './someScreen';
import { StoryScreen } from './storyScreen';

/**
 * Represents a dynamic screen maker that can create screens based on provided game states.
 */
export class DynamicScreenMaker implements ScreenMaker {
  constructor(
    public builder: Build,
    public gameScreen: (game: GameState, sm: ScreenMaker) => StackScreen,
    public overScreen: (game: GameState, sm: ScreenMaker) => StackScreen,
    public someScreen: (game: GameState, sm: ScreenMaker) => StackScreen,
    public init: (sm: ScreenMaker) => StackScreen,
    public seed: number,
    public game: GameState | null = null,
  ) {}

  /**
   * Creates a new game screen.
   *
   * @return A StackScreen representing the initial state of a new game.
   */
  public newGame(): StackScreen {
    this.game = this.builder.makeGame();
    return this.gameScreen(<GameState>this.game, this);
  }

  /**
   * Loads a saved game state and returns the corresponding game screen.
   *
   * @param saveState - The serialized game state to load.
   * @return A StackScreen representing the loaded game state.
   */
  public loadGame(saveState: SerializedGameState): StackScreen {
    this.game = this.builder.restoreGame(saveState);
    this.game.shouldShowStoryScreen = false;
    return this.gameScreen(<GameState>this.game, this);
  }

  /**
   * Generates a title screen and inserts it at the start of the document.
   * The title screen will be passed the given seed.
   * The title screen will dispatch a 'start-new-game' event when the user chooses to start the game.
   * The title screen will dispatch a 'change-seed' event when the user chooses to change the seed.
   */
  public titleScreen(): void {
    GenerateTitleScreen.generate();
  }

  /**
   * Generates a game over screen and inserts it at the start of the document.
   *
   * @param game - The game state to display on the game over screen.
   * @return A StackScreen representing the game over screen.
   */
  public gameOver(game: GameState): StackScreen {
    return this.overScreen(game, this);
  }

  public something(game: GameState | null): StackScreen {
    return this.someScreen(<GameState>game, this);
  }

  /**
   * Runs a dynamic screen maker.
   * The dynamic screen maker is asked to generate its initial screen and then
   * the game over screen is shown if the game has ended.
   * The story screen is then shown if requested.
   * The screens are then run in order by the EventManager.
   *
   * @param dynamicScreenMaker - The dynamic screen maker to run.
   */
  static runDynamic(dynamicScreenMaker: DynamicScreenMaker) {
    const initialScreen = dynamicScreenMaker.init(dynamicScreenMaker);
    const game = dynamicScreenMaker.game;
    const stack = new ScreenStack();
    stack.push(initialScreen);

    if (game && game.shouldShowStoryScreen) {
      stack.push(new StoryScreen(game, dynamicScreenMaker));
      game.shouldShowStoryScreen = false;
    }
    EventManager.runWithInteractiveScreen(stack);
  }

  /**
   * Runs a predefined sequence where the game over screen is shown first.
   *
   * @param builder - The builder for creating games.
   */
  public static async runBuilt_InitialGameSetup(builder: Build, seed: number) {
    const dynamicScreenMaker = new DynamicScreenMaker(
      builder,
      (game: GameState, sm: ScreenMaker) => new GameScreen(game, sm),
      (game: GameState, sm: ScreenMaker) => new GameOverScreen(game, sm),
      (game: GameState, sm: ScreenMaker) => new SomeScreen(game, sm),
      (sm: ScreenMaker) => sm.newGame(),
      seed,
    );
    this.runDynamic(dynamicScreenMaker);
  }

  /**
   * Runs a predefined sequence where the game over screen is shown first.
   *
   * @param builder - The builder for creating games.
   * @param seed - The seed for the random number generator.
   * @param saveState - The serialized game state to load.
   */
  public static async runBuilt_RestoreGameSetup(
    builder: Build,
    seed: number,
    saveState: SerializedGameState,
  ) {
    const dynamicScreenMaker = new DynamicScreenMaker(
      builder,
      (game: GameState, sm: ScreenMaker) => new GameScreen(game, sm),
      (game: GameState, sm: ScreenMaker) => new GameOverScreen(game, sm),
      (game: GameState, sm: ScreenMaker) => new SomeScreen(game, sm),
      (sm: ScreenMaker) => sm.loadGame(saveState),
      seed,
    );
    this.runDynamic(dynamicScreenMaker);
  }
}
