import { AttackDamageChangeTick } from '../buffs/attackDamageChangeTick';
import { Buff } from '../buffs/buffEnum';
import { BuffCommand } from './buffCommand';
import { BuffType, Tick } from '../../shared-types/gameLogic/buffs/buffType';
import { DefenseChangeTick } from '../buffs/defenseChangeTick';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Mob } from '../mobs/mob';

const DEFAULT_BUFF_DURATION = 50;

export class StatChangeBuffCommand extends BuffCommand {
  private static readonly statBuffConfigMap: Partial<
    Record<
      Buff,
      {
        adjust: (game: GameState, amount: number) => void;
        createTick: (
          target: Mob,
          game: GameState,
          absoluteAmount: number,
        ) => Tick;
      }
    >
  > = {
    [Buff.AttackUp]: {
      adjust: (game, amount) => game.stats.adjustDamageDealModifier(amount),
      createTick: (target, game, absoluteAmount) =>
        new AttackDamageChangeTick(target, game, absoluteAmount),
    },
    [Buff.AttackDown]: {
      adjust: (game, amount) => game.stats.adjustDamageDealModifier(-amount),
      createTick: (target, game, absoluteAmount) =>
        new AttackDamageChangeTick(target, game, -absoluteAmount),
    },
    [Buff.DefenseUp]: {
      adjust: (game, amount) => game.stats.adjustDamageReceiveModifier(-amount),
      createTick: (target, game, absoluteAmount) =>
        new DefenseChangeTick(target, game, -absoluteAmount),
    },
    [Buff.DefenseDown]: {
      adjust: (game, amount) => game.stats.adjustDamageReceiveModifier(amount),
      createTick: (target, game, absoluteAmount) =>
        new DefenseChangeTick(target, game, absoluteAmount),
    },
  };

  constructor(
    public buff: Buff,
    public target: Mob,
    public game: GameState,
    public me: Mob,
    public amount: number,
    public duration: number = DEFAULT_BUFF_DURATION,
    public timeLeft: number = duration,
  ) {
    super(buff, target, game, me, duration, timeLeft);
  }

  /**
   * Executes the stat change buff command.
   *
   * This method applies a stat change buff to the target mob, adjusting
   * the game state accordingly. It ensures that the same buff does not
   * stack on the target and calculates the absolute amount for proper
   * logic handling. Depending on the buff type, it applies the appropriate
   * stat adjustment and creates the corresponding tick effect.
   *
   * @returns Always returns true, indicating successful execution.
   */

  public execute(): boolean {
    const { game, target, amount, buff } = this;

    if (this.target.buffs.is(this.buff)) return true; // prevent stacking of the same buff

    const config = StatChangeBuffCommand.statBuffConfigMap[buff];
    let effect: Tick | undefined = undefined;

    if (config) {
      config.adjust(game, amount);
      // The amount can be negative, if loading a saved game, but needs to be a positive value for the logic to work
      const absoluteAmount = Math.abs(amount);
      effect = config.createTick(target, game, absoluteAmount);
    }

    const active: BuffType = {
      buff: this.buff,
      duration: this.duration,
      timeLeft: this.timeLeft,
      effect: effect,
    };

    super.addBuffToMob(active, this.game, this.target);
    return true;
  }
}
