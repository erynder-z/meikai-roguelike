import { BaseScreen } from './baseScreen';
import { DrawableTerminal } from '../../types/terminal/drawableTerminal';
import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { GameState } from '../../types/gameBuilder/gameState';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../types/terminal/stack';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

export class AttackAnimationScreen extends BaseScreen {
  public name = 'attack-animation-screen';

  constructor(
    public game: GameState,
    public make: ScreenMaker,
    public pos: WorldPoint,
    public isAttackByPlayer: boolean,
    public isDig: boolean,
    public isRanged: boolean,
  ) {
    super(game, make);
  }

  /**
   * Handles key down events.
   *
   * @param {KeyboardEvent} event - The keyboard event.
   * @param {Stack} stack - The stack of screens.
   * @returns {boolean} True if the event was handled successfully, otherwise false.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): boolean {
    return false;
  }

  /**
   * Draws the attack animation on the terminal.
   *
   * @param {DrawableTerminal} term - The terminal to draw on.
   */
  public drawScreen(term: DrawableTerminal): void {
    if (this.isDig) {
      this.drawAttackAnimation(term, 'burst');
      return;
    }

    if (this.isRanged) {
      this.drawAttackAnimation(term, 'ranged');
      return;
    }

    const attackType = this.isAttackByPlayer ? 'longerSlash' : 'shorterSlash';
    this.drawAttackAnimation(term, attackType);
  }

  /**
   * Removes the attack animation screen from the stack.
   *
   * @param {Stack} stack - The stack of screens.
   * @return {boolean} True if the screen was popped successfully, otherwise false.
   */
  public onTime(stack: Stack): boolean {
    stack.removeScreen(this);
    return true;
  }
  /**
   * Draws the attack animation of a given type on the given terminal.
   *
   * @param {DrawableTerminal} term - The terminal to draw on.
   * @param {string} type - The type of attack animation to draw. Must be one of
   *   'longerSlash', 'shorterSlash', 'burst', or 'ranged'.
   */
  private drawAttackAnimation(
    term: DrawableTerminal,
    type: 'longerSlash' | 'shorterSlash' | 'burst' | 'ranged',
  ): void {
    const { color, opacityFactor, thickness } = this.getAnimationParams(type);
    const targetPos = this.getTargetPosition();
    const drawingMethod = this.getDrawingMethod(term, type);
    drawingMethod(targetPos.x, targetPos.y, color, opacityFactor, thickness);
  }

  /**
   * Gets the parameters for the attack animation given the type of attack.
   *
   * @param {string} type - The type of attack animation to draw. Must be one of
   *   'longerSlash', 'shorterSlash', 'burst', or 'ranged'.
   * @returns {{ color: string, opacityFactor: number, thickness: number }}
   *   An object with the color, opacity factor, and line thickness for the attack
   *   animation.
   */
  private getAnimationParams(
    type: 'longerSlash' | 'shorterSlash' | 'burst' | 'ranged',
  ): { color: string; opacityFactor: number; thickness: number } {
    const gameConfig = gameConfigManager.getConfig();
    const color = type === 'shorterSlash' ? '#a7001b' : gameConfig.player.color;
    const opacityFactor = 0.9;
    const thickness = type === 'shorterSlash' ? 2 : 1;
    return { color, opacityFactor, thickness };
  }

  /**
   * Returns the drawing method on the given terminal that corresponds to the
   * given type of attack animation.
   *
   * @param {DrawableTerminal} term - The terminal to draw on.
   * @param {string} type - The type of attack animation to draw. Must be one of
   *   'longerSlash', 'shorterSlash', 'burst', or 'ranged'.
   * @returns {(x: number, y: number, color: string, opacityFactor: number,
   *     thickness: number) => void} The drawing method on the given terminal.
   */
  private getDrawingMethod(
    term: DrawableTerminal,
    type: 'longerSlash' | 'shorterSlash' | 'burst' | 'ranged',
  ): (
    x: number,
    y: number,
    color: string,
    opacityFactor: number,
    thickness: number,
  ) => void {
    switch (type) {
      case 'longerSlash':
        return term.drawLongerSlashAttackOverlay.bind(term);
      case 'shorterSlash':
        return term.drawShorterSlashAttackOverlay.bind(term);
      case 'ranged':
        return term.drawProjectileExplosion.bind(term);
      case 'burst':
      default:
        return term.drawBurstAttackOverlay.bind(term);
    }
  }

  /**
   * Calculates the position of the target mob on the terminal based on its world position,
   * taking into account the player's position.
   *
   * @return {WorldPoint} The position of the target mob on the terminal.
   */
  private getTargetPosition(): WorldPoint {
    const terminalCenter = new WorldPoint(
      Math.floor(this.gameConfig.terminal.dimensions.width * 0.5),
      Math.floor(this.gameConfig.terminal.dimensions.height * 0.5),
    );
    const playerPos = this.game.player.pos;

    return new WorldPoint(
      this.pos.x + (terminalCenter.x - playerPos.x),
      this.pos.y + (terminalCenter.y - playerPos.y),
    );
  }
}
