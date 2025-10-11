import { GameState } from '../../shared-types/gameBuilder/gameState';
import { BuffType, Tick } from '../../shared-types/gameLogic/buffs/buffType';
import { BleedTick } from '../buffs/bleedTick';
import { Buff } from '../buffs/buffEnum';
import { BurnTick } from '../buffs/burnTick';
import { FreezeTick } from '../buffs/freezeTick';
import { PetrifyTick } from '../buffs/petrifyTick';
import { PoisonTick } from '../buffs/poisonTick';
import { Mob } from '../mobs/mob';
import { CommandBase } from './commandBase';

const BURN_DMG_MIN = 2;
const BURN_DMG_MAX = 4;
const LAVA_DMG_MIN = 5;
const LAVA_DMG_MAX = 10;
const DEFAULT_BUFF_DURATION = 8;

/**
 * Represents the buff command that adds a buff to a mob.
 */
export class BuffCommand extends CommandBase {
  private static readonly buffToTickMap: Partial<
    Record<Buff, (target: Mob, game: GameState) => Tick>
  > = {
    [Buff.Poison]: (target, game) => new PoisonTick(target, game),
    [Buff.Burn]: (target, game) =>
      new BurnTick(target, game, BURN_DMG_MIN, BURN_DMG_MAX),
    [Buff.Freeze]: (target, game) => new FreezeTick(target, game),
    [Buff.Bleed]: (target, game) => new BleedTick(target, game),
    [Buff.Petrify]: (target, game) => new PetrifyTick(target, game),
    [Buff.Lava]: (target, game) =>
      new BurnTick(target, game, LAVA_DMG_MIN, LAVA_DMG_MAX),
  };

  constructor(
    public buff: Buff,
    public target: Mob,
    public game: GameState,
    public me: Mob,
    public duration: number = DEFAULT_BUFF_DURATION,
    public timeLeft: number = duration,
  ) {
    super(me, game);
  }
  /**
   * Executes the buff command.
   *
   * @returns Always returns true.
   */
  public execute(): boolean {
    const { game, target, buff } = this;

    const tickFactory = BuffCommand.buffToTickMap[buff];
    const effect = tickFactory ? tickFactory(target, game) : undefined;

    const active: BuffType = {
      buff: this.buff,
      duration: this.duration,
      timeLeft: this.timeLeft,
      effect: effect,
    };

    this.addBuffToMob(active, this.game, this.target);
    return true;
  }

  /**
   * Add a buff to a mob in the game.
   *
   * @param active - the buff to add.
   * @param game - the game where the mob exists.
   * @param mob - the mob to add the buff to.
   */
  public addBuffToMob(active: BuffType, game: GameState, mob: Mob): void {
    mob.buffs.add(active, game, mob);
  }
}
