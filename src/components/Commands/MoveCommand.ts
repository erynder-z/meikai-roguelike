import { GameIF } from '../Builder/Interfaces/GameIF';
import { MapIF } from '../MapModel/Interfaces/MapIF';
import { Glyph } from '../Glyphs/Glyph';
import { WorldPoint } from '../MapModel/WorldPoint';
import { Mob } from '../Mobs/Mob';
import { CommandBase } from './CommandBase';
import { StairCommand } from './StairCommand';
import { ItemObject } from '../ItemObjects/ItemObject';
import { Act } from './Act';
import { LogMessage, EventCategory } from '../Messages/LogMessage';
import { Buff } from '../Buffs/BuffEnum';
import { BuffCommand } from './BuffCommand';

/**
 * Represents a move command that extends the functionality of the base command.
 */
export class MoveCommand extends CommandBase {
  constructor(
    public dir: WorldPoint,
    public me: Mob,
    public game: GameIF,
    public act: Act = Act.Move,
  ) {
    super(me, game);
  }

  /**
   * Executes the move command without checking for obstacles.
   * @returns {boolean} Always returns true.
   */
  execute0(): boolean {
    const map = <MapIF>this.game.currentMap();
    const np = this.dir.plus(this.me.pos);
    map.moveMob(this.me, np);
    return true;
  }

  /**
   * Executes the move command, checking for obstacles.
   * @returns {boolean} True if the move is legal and executed successfully, otherwise false.
   */
  execute(): boolean {
    const map = <MapIF>this.game.currentMap();
    const np = this.dir.plus(this.me.pos);
    const legal = !map.isBlocked(np);
    const slowing = map.cell(np).isSlowing();
    const burning = map.cell(np).isBurning();
    if (legal) {
      slowing &&
        new BuffCommand(Buff.Slow, this.me, this.game, this.me, 2).execute();
      burning &&
        new BuffCommand(Buff.Lava, this.me, this.game, this.me).execute();
      this.me.sinceMove = 0;
      map.moveMob(this.me, np);
      if (this.me.isPlayer) {
        this.dealWithStairs(map, np);
        this.flashIfItem();
      }
    }

    const m = this.me;

    if (m.isPlayer) this.game.addCurrentEvent(EventCategory.moving);

    return legal;
  }

  /**
   * Deals with stairs after the move, if the player has encountered stairs.
   * @param {MapIF} map - The map object.
   * @param {WorldPoint} np - The new position after the move.
   * @returns {void}
   */
  dealWithStairs(map: MapIF, np: WorldPoint): void {
    let dir: number;

    switch (map.cell(np).env) {
      case Glyph.StairsDown:
        dir = 1;
        break;
      case Glyph.StairsUp:
        dir = -1;
        break;
      default:
        return;
    }
    new StairCommand(dir, this.game).raw();
  }

  flashIfItem(): void {
    const map: MapIF = <MapIF>this.game.currentMap();
    const np: WorldPoint = this.game.player.pos;
    const o: ItemObject | undefined = map.cell(np).obj;

    if (o) {
      const msg = new LogMessage(
        `${o.description()} is lying here`,
        EventCategory.layingObject,
      );
      this.game.message(msg);
      /*  this.game.flash(msg); */
    }
  }
}
