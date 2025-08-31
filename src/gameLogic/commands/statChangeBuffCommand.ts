import { AttackDamageChangeTick } from '../buffs/attackDamageChangeTick';
import { Buff } from '../buffs/buffEnum';
import { BuffCommand } from './buffCommand';
import { BuffType, Tick } from '../../shared-types/gameLogic/buffs/buffType';
import { DefenseChangeTick } from '../buffs/defenseChangeTick';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Mob } from '../mobs/mob';

const DEFAULT_BUFF_DURATION = 50;

export class StatChangeBuffCommand extends BuffCommand {
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
    const { game, target, amount } = this;

    if (this.target.buffs.is(this.buff)) return true; // prevent stacking of the same buff

    const absoluteAmount = Math.abs(amount); // The amount can be negative, if loading a saved game, but needs to be a positive value for the logic to work

    let effect: Tick | undefined = undefined;
    switch (this.buff) {
      case Buff.AttackUp:
        this.game.stats.adjustDamageDealModifier(amount);
        effect = new AttackDamageChangeTick(target, game, absoluteAmount);
        break;
      case Buff.AttackDown:
        this.game.stats.adjustDamageDealModifier(-amount);
        effect = new AttackDamageChangeTick(target, game, -absoluteAmount);
        break;
      case Buff.DefenseUp:
        this.game.stats.adjustDamageReceiveModifier(-amount);
        effect = new DefenseChangeTick(target, game, -absoluteAmount);
        break;
      case Buff.DefenseDown:
        this.game.stats.adjustDamageReceiveModifier(amount);
        effect = new DefenseChangeTick(target, game, absoluteAmount);
        break;
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
