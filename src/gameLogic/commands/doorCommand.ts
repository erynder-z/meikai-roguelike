import { Command } from '../../types/gameLogic/commands/command';
import { CommandBase } from './commandBase';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameMapType } from '../../types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../../types/gameBuilder/gameState';
import { Glyph } from '../glyphs/glyph';
import { Mob } from '../mobs/mob';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Represents a command for interacting with doors in the game.
 */
export class DoorCommand extends CommandBase {
  constructor(
    public me: Mob,
    public game: GameState,
    public direction: WorldPoint = new WorldPoint(),
  ) {
    super(me, game);
  }

  /**
   * Sets the direction for the command.
   * @param direction - The direction to set.
   * @returns The command object.
   */
  public setDirection(direction: WorldPoint): Command {
    this.direction = direction;
    return this;
  }

  /**
   * Executes the door command.
   * @returns True if the command is executed successfully, false otherwise.
   */
  public execute(): boolean {
    const position = this.me.pos;
    const door = position.plus(this.direction);
    const map = <GameMapType>this.game.currentMap();
    const cell = map.cell(door);

    const defaultMsg = new LogMessage(
      'There is no door there.',
      EventCategory.unable,
    );

    switch (cell.env) {
      case Glyph.Door_Closed:
        cell.env = Glyph.Door_Open;
        break;
      case Glyph.Door_Open:
        cell.env = Glyph.Door_Closed;
        break;

      default:
        this.game.flash(defaultMsg);
        return false;
    }
    this.message(cell.env);
    return true;
  }

  /**
   * Displays a message about the door action.
   * @param env - The environment of the door.
   */
  private message(env: Glyph): void {
    const { game } = this;

    const open = env === Glyph.Door_Open;
    const action = open ? 'opens' : 'closes';
    const who = this.me.name;

    const msg = new LogMessage(
      `${who} ${action} the door.`,
      EventCategory.door,
    );

    game.message(msg);
  }
}
