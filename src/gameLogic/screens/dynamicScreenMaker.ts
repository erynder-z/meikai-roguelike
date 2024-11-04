import { Build } from '../../types/gameBuilder/build';
import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { GameOverScreen } from './gameOverScreen';
import { GameScreen } from './gameScreen';
import { GenerateTitleScreen } from '../../utilities/generateTitleScreen';
import { GameState } from '../../types/gameBuilder/gameState';
import { ImageHandler } from '../../utilities/imageHandler/imageHandler';
import { lvlTier00Images } from '../../utilities/imageHandler/imageImports/levelImages';
import { MoreScreen } from './moreScreen';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { ScreenStack } from '../../terminal/screenStack';
import { StackScreen } from '../../types/terminal/stackScreen';

/**
 * Represents a dynamic screen maker that can create screens based on provided game states.

 */
export class DynamicScreenMaker implements ScreenMaker {
  constructor(
    public builder: Build,
    public gameScreen: (game: GameState, sm: ScreenMaker) => StackScreen,
    public overScreen: (game: GameState, sm: ScreenMaker) => StackScreen,
    public moreScreen: (game: GameState, sm: ScreenMaker) => StackScreen,
    public init: (sm: ScreenMaker) => StackScreen,
    public seed: number,
    public game: GameState | null = null,
    
  ) {}

  /**
   * Creates a new game screen.
   *
   * @returns {StackScreen} A StackScreen representing the initial state of a new game.
   */
  public newGame(): StackScreen {
    this.game = this.builder.makeGame();
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
   * Creates a game over screen.
   *
   * @returns {StackScreen} A StackScreen representing the game over state.
   */
  public gameOver(): StackScreen {
    return this.overScreen(<GameState>this.game, this);
  }

  public more(game: GameState | null): StackScreen {
    return this.moreScreen(<GameState>game, this);
  }

  /**
   * Runs a dynamic screen sequence.
   *
   * @param {ScreenMaker_Dynamic} dynamicScreenMaker - The dynamic screen maker instance to run.
   */
  static runDynamic(dynamicScreenMaker: DynamicScreenMaker) {
    ScreenStack.run_StackScreen(dynamicScreenMaker.init(dynamicScreenMaker));
  }

  /**
   * Runs a predefined sequence where the game over screen is shown first.
   *
   * @param {Build} builder - The builder for creating games.
   */
  public static async runBuilt_InitialGameSetup(builder: Build, seed: number) {
    const dynamicScreenMaker = new DynamicScreenMaker(
      builder,
      (game: GameState, sm: ScreenMaker) => new GameScreen(game, sm),
      (game: GameState, sm: ScreenMaker) => new GameOverScreen(game, sm),
      (game: GameState, sm: ScreenMaker) => new MoreScreen(game, sm),
      (sm: ScreenMaker) => sm.newGame(),
      seed,
    );
    this.drawFirstImage();
    this.runDynamic(dynamicScreenMaker);
  }

  /**
   * Displays a random level change image when the game is started.
   *
   * The image is displayed using the {@link ImageHandler} and the image type is "lvlChange".
   * If images are disabled in the game config, then this function does nothing.
   */
  private static drawFirstImage(): void {
    const gameConfig = gameConfigManager.getConfig();
    const shouldShowImages = gameConfig.show_images;

    if (!shouldShowImages) return;

    const randomImage =
      lvlTier00Images[Math.floor(Math.random() * lvlTier00Images.length)];

    const imageHandler = ImageHandler.getInstance();
    const image = new Image();
    image.src = randomImage;
    imageHandler.displayImage(image, 'lvlChange');
  }
}
