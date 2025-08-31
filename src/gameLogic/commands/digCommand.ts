import { AttackAnimationScreen } from '../screens/attackAnimationScreen';
import { CommandBase } from './commandBase';
import { EnvironmentChecker } from '../environment/environmentChecker';
import { EventCategory } from '../messages/logMessage';
import { GameMapType } from '../../shared-types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Glyph } from '../glyphs/glyph';
import { GlyphMap } from '../glyphs/glyphMap';
import { LogMessage } from '../messages/logMessage';
import { Mob } from '../mobs/mob';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../shared-types/terminal/stack';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Represents a command to dig through rocks.
 */
export class DigCommand extends CommandBase {
  constructor(
    public dir: WorldPoint,
    public me: Mob,
    public game: GameState,
    public stack: Stack,
    public make: ScreenMaker,
  ) {
    super(me, game);
  }

  /**
   * Executes the dig command. Digging has a 10% chance of success.
   *
   * @return Returns true if the dig command was executed successfully, otherwise false.
   */
  public execute(): boolean {
    const { game } = this;
    const { player, rand } = game;

    const map = <GameMapType>game.currentMap();
    const newPosition = player.pos.plus(this.dir);
    const cell = map.cell(newPosition);
    const env = cell.env;
    const isDiggable = GlyphMap.getGlyphInfo(env).isDiggable;

    if (!isDiggable) {
      const msg = new LogMessage('Cannot dig there!', EventCategory.unable);
      game.flash(msg);
      return false;
    }

    const digCellEnv = cell.env;
    const digSuccess = rand.isOneIn(10);

    const isAttackByPlayer = true;
    const isDig = true;
    const isRanged = false;

    this.stack.push(
      new AttackAnimationScreen(
        this.game,
        this.make,
        newPosition,
        isAttackByPlayer,
        isDig,
        isRanged,
      ),
    );

    if (digSuccess) {
      cell.env = Glyph.Regular_Floor;
      EnvironmentChecker.clearCellEffectInArea(newPosition, map, digCellEnv);

      const msg = new LogMessage(
        `You dig through the ${GlyphMap.getGlyphInfo(digCellEnv).name}!`,
        EventCategory.dig,
      );
      game.message(msg);
    } else {
      const msg = new LogMessage('Digging...', EventCategory.dig);
      game.flash(msg);
    }
    return true;
  }
}
