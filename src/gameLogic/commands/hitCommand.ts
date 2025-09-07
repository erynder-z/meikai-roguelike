import { Act } from './act';
import { AttackAnimationScreen } from '../screens/attackAnimationScreen';
import { BloodVisualsHandler } from '../../utilities/bloodVisualsHandler';
import { Buff } from '../buffs/buffEnum';
import { CommandBase } from './commandBase';
import { Equipment } from '../inventory/equipment';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { HealthAdjust } from './healthAdjust';
import { Mob } from '../mobs/mob';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { Stack } from '../../shared-types/terminal/stack';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';

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
   *
   * @returns Returns true if the hit was successful, false otherwise.
   */
  public execute(): boolean {
    const { game, me } = this;
    const { rand } = game;

    let dmg: number = this.calcDamage(rand, me);
    let back: number = 0;

    if (me.is(Buff.Shock) && rand.isOneIn(2)) {
      dmg = this.shockDmg(dmg);
      back = rand.randomIntegerInclusive(2, 3);
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
   * @param dmg - The damage value.
   * @return The calculated shock damage.
   */
  private shockDmg(dmg: number): number {
    return Math.floor(dmg * 1.5);
  }

  /**
   * Applies damage to a target mob, adjusting based on player status and equipment.
   *
   * @param dmg - The initial damage amount to be dealt.
   * @param target - The mob receiving the damage.
   * @param attacker - The mob inflicting the damage.
   * @param game - The current game state.
   * @param me - The name of the attacker.
   * @param him - The name of the target.
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
   * @param game - The game object.
   */
  private clearCharm(_game: GameState) {
    const { him } = this;

    if (!him.is(Buff.Charm)) return;
    him.buffs.cleanse(Buff.Charm, this.game, him);
  }

  /**
   * Calculates the damage dealt by the hit command.
   *
   * @param rand - The random generator used to calculate damage.
   * @param me - The mob initiating the hit.
   * @returns The calculated damage.
   */
  private calcDamage(rand: RandomGenerator, me: Mob): number {
    return rand.randomIntegerInclusive(0, this.power(me));
  }

  /**
   * Calculates the power of the mob initiating the hit.
   *
   * @param me - The mob initiating the hit.
   * @returns The power of the mob.
   */
  private power(me: Mob): number {
    return me.isPlayer ? this.playerPower(me) : this.npcPower(me);
  }

  /**
   * Calculates the power of an NPC.
   *
   * @param mob - The NPC mob.
   * @returns The power of the NPC.
   */
  private npcPower(mob: Mob): number {
    return (mob.level + 1) * mob.currentStrength;
  }

  /**
   * Calculates the power of the player when unarmed.
   *
   * @returns The calculated power.
   */
  private unarmed(): number {
    const baseDmg = 1;
    return baseDmg;
  }

  /**
   * Calculates the power of a player.
   *
   * @param player - The player mob.
   * @returns The power of the player.
   */
  private playerPower(player: Mob): number {
    const game = this.game;
    if (game.equipment)
      return (
        this.equipmentPower(game, game.equipment, player) *
        player.currentStrength
      );
    return this.unarmed();
  }

  /**
   * Calculates the power of a player based on their equipment.
   * If the player is under the Disarm buff, it will return the unarmed power.
   *
   * @param game - The game object.
   * @param equipment - The player's equipment.
   * @param player - The player mob.
   * @returns The power of the player based on their equipment.
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
    return this.unarmed();
  }

  /**
   * Generates a combat message based on the attacker, target, and damage dealt.
   *
   * @param dmg - The amount of damage dealt.
   * @param attacker - The mob causing the damage.
   * @param target - The mob receiving the damage.
   * @param attackerName - The name of the attacking mob.
   * @param targetName - The name of the target mob.
   * @param remainingHp - The remaining HP of the target after the damage.
   * @returns The generated combat message.
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
   * @param him - The mob that is being attacked.
   * @param isAttackByPlayer - True if the attack is by the player, false otherwise.
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
