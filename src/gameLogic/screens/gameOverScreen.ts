import { BaseScreen } from './baseScreen';
import { DrawUI } from '../../renderer/drawUI';
import { GameOverScreenDisplay } from '../../ui/gameOverScreenDisplay/gameOverScreenDisplay';
import { GameState } from '../../types/gameBuilder/gameState';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../types/terminal/stack';

/**
 * Represents a game over screen implementation that is part of a terminal-based application stack.
 */
export class GameOverScreen extends BaseScreen {
  public name = 'gameover';
  private display: GameOverScreenDisplay | null = null;

  constructor(
    public game: GameState,
    public make: ScreenMaker,
  ) {
    super(game, make);
  }

  /**
   * Draws the game over screen.
   *
   * This method creates a 'game-over-screen-display' component and appends it to the
   * 'canvas-container' if the component does not already exist.
   *
   * The component is populated with the player's name, color, and a post-mortem analysis
   * of the game. The component also displays instructions for returning to the title
   * screen.
   */
  public drawScreen(): void {
    const container = document.getElementById('canvas-container');
    if (!container || container.querySelector('game-over-screen-display'))
      return;

    if (!this.display) {
      this.display = document.createElement(
        'game-over-screen-display',
      ) as GameOverScreenDisplay;

      this.display.game = this.game;
      this.display.playerName = `${this.game.player.name} ✝`;
      this.display.playerColor = this.gameConfig.player.color;
      this.display.log = this.game.log;

      const menuKey = `<span class="emphasize">${this.activeControlScheme.menu.toString()}</span>`;
      this.display.info = `Press ${menuKey} to return to the title screen.`;

      container.appendChild(this.display);
    }

    DrawUI.renderActionImage(this.game);
    DrawUI.renderMessage(this.game);
    DrawUI.renderPlayerHealthInfo(this.game);
    DrawUI.renderLevelDepthInfo(this.game);
    DrawUI.renderLevelTemperatureInfo(this.game);
  }

  /**
   * Determines if the screen should be updated based on time.
   *
   * @return {boolean} Returns `true` if the screen should be updated, `false` otherwise.
   */
  public onTime(): boolean {
    return false;
  }

  /**
   * Handles a key down event, checking if the escape key is pressed and performing actions accordingly.
   *
   * @param {KeyboardEvent} event - The keyboard event to handle.
   * @param {Stack} stack - The current stack of screens.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): void {
    if (event.key === this.activeControlScheme.menu.toString()) {
      this.display?.remove();
      stack.pop();
      this.make.titleScreen();
    }
  }
}
