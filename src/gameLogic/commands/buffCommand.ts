import { BleedTick } from '../buffs/bleedTick';
import { Buff } from '../buffs/buffEnum';
import { BuffType } from '../../shared-types/gameLogic/buffs/buffType';
import { BurnTick } from '../buffs/burnTick';
import { CommandBase } from './commandBase';
import { FreezeTick } from '../buffs/freezeTick';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Mob } from '../mobs/mob';
import { PetrifyTick } from '../buffs/petrifyTick';
import { PoisonTick } from '../buffs/poisonTick';
import { Tick } from '../../shared-types/gameLogic/buffs/buffType';

const BURN_DMG_MIN = 2;
const BURN_DMG_MAX = 4;
const LAVA_DMG_MIN = 5;
const LAVA_DMG_MAX = 10;
const DEFAULT_BUFF_DURATION = 8;

/**
 * Represents the buff command that adds a buff to a mob.
 */
export class BuffCommand extends CommandBase {
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
    const { game, target } = this;

    let effect: Tick | undefined = undefined;
    switch (this.buff) {
      case Buff.Poison:
        effect = new PoisonTick(target, game);
        break;
      case Buff.Burn:
        effect = new BurnTick(target, game, BURN_DMG_MIN, BURN_DMG_MAX);
        break;
      case Buff.Freeze:
        effect = new FreezeTick(target, game);
        break;
      case Buff.Bleed:
        effect = new BleedTick(target, game);
        break;
      case Buff.Petrify:
        effect = new PetrifyTick(target, game);
        break;
      case Buff.Lava:
        effect = new BurnTick(target, game, LAVA_DMG_MIN, LAVA_DMG_MAX);
        break;
    }

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
