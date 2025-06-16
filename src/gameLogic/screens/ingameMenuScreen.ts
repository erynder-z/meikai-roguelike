import { BaseScreen } from './baseScreen';
import { GameState } from '../../types/gameBuilder/gameState';
import { IngameMenu } from '../../ui/menu/ingameMenu';
import { IngameOptions } from '../../ui/menu/ingameOptions';
import { LayoutManager } from '../../ui/layoutManager/layoutManager';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../types/terminal/stack';

/**
 *  This class is only responsible for drawing the menu components. All logic for the menus is handled in the web components.
 */
export class IngameMenuScreen extends BaseScreen {
  public name = 'ingame-menu';
  private stack: Stack;

  constructor(game: GameState, make: ScreenMaker, stack: Stack) {
    super(game, make);
    this.stack = stack;
  }

  /**
   * Draws the in-game menu screen by invoking the `drawIngameMenu` function,
   * which creates and inserts the 'ingame-menu' element into the main body
   * of the document. This function does not perform any additional actions
   * beyond drawing the in-game menu.
   */
  public drawScreen(): void {
    this.drawIngameMenu();
  }

  /**
   * Draws the in-game menu by creating and inserting the 'ingame-menu' element
   * into the main body of the document if neither 'ingame-menu' nor 'ingame-options'
   * elements are present. This function ensures the body element exists before
   * attempting insertion. It also adds event listeners to the menu to handle
   * opening the options menu and returning to the game.
   *
   */
  private drawIngameMenu(): void {
    if (
      !document.querySelector('ingame-menu') &&
      !document.querySelector('ingame-options')
    ) {
      const body = document.getElementById('body-main');
      const menuScreen = document.createElement('ingame-menu') as IngameMenu;
      menuScreen.currentGame = this.game;

      if (!body) {
        console.error('Body element not found');
        return;
      }

      if (body.firstChild) {
        body.insertBefore(menuScreen, body.firstChild);
      } else {
        body.appendChild(menuScreen);
      }

      menuScreen.addEventListener('open-options-menu', () => {
        this.drawOptionsMenu();
      });

      menuScreen.addEventListener('return-to-game', () => {
        this.stack.pop();
      });
    }
  }

  /**
   * Draws the options menu by creating and inserting the 'ingame-options' element
   * into the main body of the document if the 'ingame-options' element does not
   * already exist. This function ensures the body element exists before
   * attempting insertion. It also adds event listeners to the menu to handle
   * opening the ingame menu.
   */
  private drawOptionsMenu(): void {
    if (!document.querySelector('ingame-options')) {
      const body = document.getElementById('body-main');

      if (!body) {
        console.error('Body element not found');
        return;
      }

      const optionsMenu = document.createElement(
        'ingame-options',
      ) as IngameOptions;

      // Ensure the titleContainer is the first child of the body
      if (body.firstChild) {
        body.insertBefore(optionsMenu, body.firstChild);
      } else {
        body.appendChild(optionsMenu);
      }

      optionsMenu.addEventListener('open-ingame-menu', () => {
        this.drawIngameMenu();
      });

      optionsMenu.addEventListener('redraw-message-display', () => {
        const layoutManager = new LayoutManager();
        layoutManager.redrawMessages(this.game.log);
      });
    }
  }
}
