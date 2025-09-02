import { BaseScreen } from './baseScreen';
import { Command } from '../../shared-types/gameLogic/commands/command';
import { CommandDirectionScreenDisplay } from '../../ui/commandDirectionScreenDisplay/commandDirectionScreenDisplay';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../shared-types/terminal/stack';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Represents a screen for selecting a direction for a command.
 */
export class CommandDirectionScreen extends BaseScreen {
  public name = 'command-direction-screen';
  private display: CommandDirectionScreenDisplay | null = null;
  private directionMap: { [key: string]: { x: number; y: number } } = {
    [this.activeControlScheme.move_left.toString()]: { x: -1, y: 0 },
    [this.activeControlScheme.move_right.toString()]: { x: 1, y: 0 },
    [this.activeControlScheme.move_up.toString()]: { x: 0, y: -1 },
    [this.activeControlScheme.move_down.toString()]: { x: 0, y: 1 },
    [this.activeControlScheme.move_up_left.toString()]: { x: -1, y: -1 },
    [this.activeControlScheme.move_up_right.toString()]: { x: 1, y: -1 },
    [this.activeControlScheme.move_down_left.toString()]: { x: -1, y: 1 },
    [this.activeControlScheme.move_down_right.toString()]: { x: 1, y: 1 },
  };
  constructor(
    public command: Command,
    public game: GameState,
    public make: ScreenMaker,
  ) {
    super(game, make);
  }

  /**
   * Converts a numpad key string to its corresponding numeric character.
   *
   * @param key - The key string to convert.
   * @return The numeric character if the key is a numpad key, otherwise the original key.
   */
  private convertNumpadKey(key: string): string {
    if (key.startsWith('Numpad')) {
      const num = key.replace('Numpad', '');
      return !isNaN(Number(num)) ? num : key;
    }
    return key;
  }

  /**
   * Draws the command direction screen using the custom display component.
   */
  public drawScreen(): void {
    const canvas = document.getElementById(
      'terminal-canvas',
    ) as HTMLCanvasElement;
    if (!this.display) {
      this.display = document.createElement(
        'command-direction-screen-display',
      ) as CommandDirectionScreenDisplay;

      const table = this.getDirectionTable();
      this.display.directions = table;
      this.display.title = 'Which direction?';

      canvas?.insertAdjacentElement('afterend', this.display);
    }
  }

  /**
   * Generates a table representing directional inputs for the command direction screen.
   *
   * Each row in the table corresponds to a direction, with symbols indicating
   * the direction visually and key mappings shown for each direction. The key
   * mappings are converted using the active control scheme's numpad settings.
   *
   * @return A 2D array representing the direction table with arrows
   * and corresponding control scheme keys.
   */
  private getDirectionTable(): string[][] {
    const convert = (key: string) => this.convertNumpadKey(key.toString());

    return [
      ['↖', ' ', '↑', ' ', '↗'],
      [
        ' ',
        convert(this.activeControlScheme.move_up_left.toString()),
        convert(this.activeControlScheme.move_up.toString()),
        convert(this.activeControlScheme.move_up_right.toString()),
        ' ',
      ],
      [
        '←',
        convert(this.activeControlScheme.move_left.toString()),
        ' ',
        convert(this.activeControlScheme.move_right.toString()),
        '→',
      ],
      [
        ' ',
        convert(this.activeControlScheme.move_down_left.toString()),
        convert(this.activeControlScheme.move_down.toString()),
        convert(this.activeControlScheme.move_down_right.toString()),
        ' ',
      ],
      ['↙', ' ', '↓', ' ', '↘'],
    ];
  }

  /**
   * Handles key down event for selecting direction.
   *
   * @param event - The keyboard event.
   * @param stack - The stack of screens.
   * @return True if the event is handled, otherwise false.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): boolean {
    if (event.key === this.activeControlScheme.menu.toString()) {
      this.closeScreen(stack);
      return true;
    }

    const char = this.controlSchemeManager.keyPressToCode(event);
    const move = this.directionMap[char];

    if (move) {
      const direction = new WorldPoint();
      direction.x = move.x;
      direction.y = move.y;
      this.closeScreen(stack);
      this.actInDirection(direction);
    }

    return true;
  }

  /**
   * Executes the command in the selected direction.
   *
   * @param direction - The selected direction.
   */
  private actInDirection(direction: WorldPoint) {
    return this.command.setDirection(direction).turn();
  }

  /**
   * Closes the command direction screen with a fade-out animation and removes it from the stack.
   *
   * @param stack - The stack of screens.
   */
  private closeScreen(stack: Stack): void {
    this.fadeOutDirectionScreen();
    stack.pop();
  }

  /**
   * Fades out the direction screen display and removes it from the DOM.
   *
   * @returns A promise that resolves when the fade out animation ends.
   */
  private async fadeOutDirectionScreen(): Promise<void> {
    if (this.display) await this.display.fadeOut();
  }
}
