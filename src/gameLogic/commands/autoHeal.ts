import { Buff } from '../buffs/buffEnum';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameState } from '../../types/gameBuilder/gameState';
import { HealthAdjust } from './healthAdjust';
import { Mob } from '../mobs/mob';

/**
 * Manages auto healing for a mob.
 */
export class AutoHeal {
  constructor(
    public amountToHealMin: number = 1,
    public timeToHealMax: number = 5,
    public nextWait: number = 0,
    public amount: number = 0,
    public countdown: number = 0,
  ) {
    this.resetHeal();
  }

  /**
   * Resets auto healing during combat for a mob.
   * @param mob - The mob to reset healing for.
   * @param game - The game object.
   */
  public static combatReset(mob: Mob, game: GameState) {
    this.clearSleep(mob, game);
    const ah = game.autoHeal;

    if (mob.isPlayer && ah) ah.resetHeal();
  }

  /**
   * Clears the sleep buff from a mob if it exists and the mob is a player,
   * and displays a message indicating that the player has woken up.
   *
   * @param mob - The mob to clear the sleep buff from.
   * @param game - The game object to display the message on.
   */
  static clearSleep(mob: Mob, game: GameState) {
    if (!mob.is(Buff.Sleep)) return;
    mob.buffs.cleanse(Buff.Sleep, game, mob);

    const msg = new LogMessage("You've woken up!", EventCategory.buff);
    if (mob.isPlayer) game.message(msg);
  }

  /**
   * Resets auto healing during combat for multiple mobs.
   * @param m1 - The first mob.
   * @param m2 - The second mob, if exists.
   * @param game - The game object.
   */
  public static combatResets(m1: Mob, m2: Mob | null, game: GameState) {
    this.combatReset(m1, game);

    if (m2) AutoHeal.combatReset(m2, game);
  }
  /**
   * Reset the healing parameters to their initial values.
   */
  private resetHeal() {
    this.nextWait = this.timeToHealMax;
    this.amount = this.amountToHealMin;
    this.countdown = this.nextWait;
  }

  /**
   * Processes a turn for auto healing.
   * @param player - The player mob.
   * @param game - The game object.
   */
  public turn(player: Mob, game: GameState) {
    if (this.isAtFullHealth(player)) return;
    this.step_timeToHeal(player, game);
  }

  /**
   * Checks if the mob is at full health.
   * @param mob - The mob to check.
   * @return {boolean} if at full health
   */
  private isAtFullHealth(mob: Mob): boolean {
    return mob.hp >= mob.maxhp;
  }

  /**
   * Steps the countdown for healing.
   * @param player - The player mob.
   * @param game - The game object.
   */
  private step_timeToHeal(player: Mob, game: GameState) {
    if (this.countdown > 0) {
      --this.countdown;
    } else {
      this.healTick(player, game);
    }
  }

  /**
   * Executes healing for the player mob.
   * @param player - The player mob.
   * @param game - The game object.
   */
  private healTick(player: Mob, game: GameState) {
    const msg = new LogMessage(
      `auto-healing ${this.amount} hp`,
      EventCategory.heal,
    );
    game.message(msg);

    HealthAdjust.heal(player, this.amount);
    ++this.amount;
    if (this.nextWait > 1) --this.nextWait;

    this.countdown = this.nextWait;
  }
}
