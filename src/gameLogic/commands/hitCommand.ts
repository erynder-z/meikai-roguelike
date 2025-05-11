import { Act } from './act';
import { AttackAnimationScreen } from '../screens/attackAnimationScreen';
import { BloodVisualsHandler } from '../../utilities/bloodVisualsHandler';
import { Buff } from '../buffs/buffEnum';
import { CommandBase } from './commandBase';
import { Equipment } from '../inventory/equipment';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameState } from '../../types/gameBuilder/gameState';
import { HealthAdjust } from './healthAdjust';
import { Mob } from '../mobs/mob';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { Stack } from '../../types/terminal/stack';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';

/**
 * Represents a command to hit another mob.
 * @extends CommandBase
 */
export class HitCommand extends CommandBase {
  constructor(
    public me: Mob,
    public him: Mob,
    public game: GameState,
    public stack: Stack,
    public make: ScreenMaker,
    public act: Act = Act.Hit,
  ) {
    super(me, game);
  }

  /**
   * Executes the hit command, dealing damage to the target mob.
   * @returns {boolean} Returns true if the hit was successful, false otherwise.
   */
  public execute(): boolean {
    const { game, me } = this;
    const { rand } = game;

    let dmg: number = this.calcDamage(rand, me);
    let back: number = 0;

    if (me.is(Buff.Shock) && rand.isOneIn(2)) {
      dmg = this.shockDmg(dmg);
      back = rand.randomIntegerClosedRange(2, 3);
    }

    const damageDealer = me.name;
    const damageReceiver = this.him.name;

    this.doDmg(dmg, this.him, me, game, damageDealer, damageReceiver);

    if (back > 0) this.doDmg(back, me, me, game, 'SHOCK', damageDealer);

    this.clearCharm(game);
    return true;
  }

  /**
   * Calculates the shock damage based on the given damage.
   *
   * @param {number} dmg - The damage value.
   * @return {number} The calculated shock damage.
   */
  private shockDmg(dmg: number): number {
    return Math.floor(dmg * 1.5);
  }

  /**
   * Applies damage to a target mob, adjusting based on player status and equipment.
   *
   * @param {number} dmg - The initial damage amount to be dealt.
   * @param {Mob} target - The mob receiving the damage.
   * @param {Mob} attacker - The mob inflicting the damage.
   * @param {GameState} game - The current game state.
   * @param {string} me - The name of the attacker.
   * @param {string} him - The name of the target.
   * @return {void} This function does not return anything.
   */
  private doDmg(
    dmg: number,
    target: Mob,
    attacker: Mob,
    game: GameState,
    me: string,
    him: string,
  ): void {
    const orig = dmg;
    if (target.isPlayer) {
      const equipmentFactor = this.game.equipment!.armorClass_reduce();
      const statsFactor = this.game.stats.damageReceiveModifier;
      dmg = Math.ceil(orig * equipmentFactor * statsFactor);
    } else {
      const statsFactor = game.stats.damageDealModifier;
      dmg = Math.ceil(orig * statsFactor);
    }

    const rest = target.hp - dmg;

    const message = this.generateCombatMessage(
      dmg,
      attacker,
      target,
      me,
      him,
      rest,
    );

    const msg1 = new LogMessage(message, EventCategory.mobDamage);
    const msg2 = new LogMessage(message, EventCategory.playerDamage);
    if (attacker.isPlayer) {
      game.message(msg1);
      game.addCurrentEvent(EventCategory.mobDamage);
      this.displayAttackAnimation(target, true);
    }
    if (target.isPlayer) {
      game.message(msg2);
      game.addCurrentEvent(EventCategory.playerDamage);
      this.displayAttackAnimation(target, false);
    }

    if (dmg) {
      BloodVisualsHandler.handleAttackBlood(target, dmg, game);
      HealthAdjust.adjust(target, -dmg, game, attacker);
    }
  }

  /**
   * Clears the Charm buff from the target mob.
   *
   * @param {GameState} game - The game object.
   */
  private clearCharm(game: GameState) {
    const { him } = this;

    if (!him.is(Buff.Charm)) return;
    him.buffs.cleanse(Buff.Charm, this.game, him);
  }

  /**
   * Calculates the damage dealt by the hit command.
   * @param {RandomGenerator} rand - The random generator used to calculate damage.
   * @param {Mob} me - The mob initiating the hit.
   * @returns {number} The calculated damage.
   */
  private calcDamage(rand: RandomGenerator, me: Mob): number {
    return rand.randomIntegerClosedRange(0, this.power(me));
  }

  /**
   * Calculates the power of the mob initiating the hit.
   * @param {Mob} me - The mob initiating the hit.
   * @returns {number} The power of the mob.
   */
  private power(me: Mob): number {
    return me.isPlayer ? this.playerPower(me) : this.npcPower(me);
  }

  /**
   * Calculates the power of an NPC.
   * @param {Mob} mob - The NPC mob.
   * @returns {number} The power of the NPC.
   */
  private npcPower(mob: Mob): number {
    return (mob.level + 1) * mob.strength;
  }

  /**
   * Returns the base power for an unarmed hit.
   * @returns {number} The base power for an unarmed hit.
   */
  private unarmed(player: Mob): number {
    return Math.ceil(player.strength);
  }

  /**
   * Calculates the power of a player.
   * @param {Mob} player - The player mob.
   * @returns {number} The power of the player.
   */
  private playerPower(player: Mob): number {
    const game = this.game;
    if (game.equipment)
      return (
        this.equipmentPower(game, game.equipment, player) * player.strength
      );
    return this.unarmed(player);
  }

  /**
   * Calculates the power of a player based on their equipment.
   * If the player is under the Disarm buff, it will return the unarmed power.
   * @param {GameState} game - The game object.
   * @param {Equipment} equipment - The player's equipment.
   * @param {Mob} player - The player mob.
   * @returns {number} The power of the player based on their equipment.
   */
  private equipmentPower(
    game: GameState,
    equipment: Equipment,
    player: Mob,
  ): number {
    const disarm = player.is(Buff.Disarm);
    if (equipment.weapon()) {
      if (disarm) {
        const msg = new LogMessage(
          'Attacking with your bare hands!',
          EventCategory.attack,
        );
        game.message(msg);
      } else {
        return equipment.weaponDamage();
      }
    }
    return this.unarmed(player);
  }

  /**
   * Generates a combat message based on the attacker, target, and damage dealt.
   *
   * @param {number} dmg - The amount of damage dealt.
   * @param {Mob} attacker - The mob causing the damage.
   * @param {Mob} target - The mob receiving the damage.
   * @param {string} attackerName - The name of the attacking mob.
   * @param {string} targetName - The name of the target mob.
   * @param {number} remainingHp - The remaining HP of the target after the damage.
   * @returns {string} The generated combat message.
   */
  private generateCombatMessage(
    dmg: number,
    attacker: Mob,
    target: Mob,
    attackerName: string,
    targetName: string,
    remainingHp: number,
  ): string {
    const isPlayerAttacker = attacker.isPlayer;
    const isPlayerTarget = target.isPlayer;

    const attackerDisplayName = isPlayerAttacker ? 'You' : attackerName;
    const targetDisplayName = isPlayerTarget ? 'You' : `the ${targetName}`;

    const verb = isPlayerAttacker ? 'hit' : 'hits';

    if (dmg > 0) {
      return `${attackerDisplayName} ${verb} ${targetDisplayName} for ${dmg}→${remainingHp}`;
    } else {
      const missVerb = isPlayerAttacker ? 'miss' : 'misses';
      return `${attackerDisplayName} ${missVerb} ${targetDisplayName}`;
    }
  }

  /**
   * Pushes an AttackAnimationScreen onto the stack if the target mob is in a cell.
   *
   * @param {Mob} him - The mob that is being attacked.
   * @param {boolean} isAttackByPlayer - True if the attack is by the player, false otherwise.
   */
  private displayAttackAnimation(him: Mob, isAttackByPlayer: boolean): void {
    const map = this.game.currentMap();
    const himPos = him.pos;
    const himCell = map?.cell(himPos);
    const isDig = false;
    const isRanged = false;

    if (himCell && himPos)
      this.stack.push(
        new AttackAnimationScreen(
          this.game,
          this.make,
          himPos,
          isAttackByPlayer,
          isDig,
          isRanged,
        ),
      );
  }
}
