import { AutoHeal } from './AutoHeal';
import { EnvironmentChecker } from '../Environment/EnvironmentChecker';
import { EventCategory } from '../Messages/LogMessage';
import { GameState } from '../Builder/Types/GameState';
import { LogMessage } from '../Messages/LogMessage';
import { Map } from '../MapModel/Types/Map';
import { Mob } from '../Mobs/Mob';
import { ItemObjectManager } from '../ItemObjects/ItemObjectManager';
import { WorldPoint } from '../MapModel/WorldPoint';

/**
 * A class to handle adjustments to health of a mob.
 */
export class HealthAdjust {
  /**
   * Adjusts the health of a mob based on the specified amount.
   * @param {Mob} mob - The mob whose health is to be adjusted.
   * @param {number} amount - The amount by which the health will be adjusted.
   * @param {GameState} game - The game object.
   * @param {Mob} entity - The entity involved in the adjustment.
   */
  public static adjust(
    mob: Mob,
    amount: number,
    game: GameState,
    entity: Mob,
  ): void {
    if (amount === 0) return;
    if (amount > 0) return this.heal(mob, amount);
    if (amount < 0) return this.damage(mob, -amount, game, entity);
  }

  /**
   * Heals the specified amount of health to the given mob.
   * @param {Mob} mob - The mob to be healed.
   * @param {number} amount - The amount of health to be healed.
   */
  public static heal(mob: Mob, amount: number): void {
    /*  console.log(`heal ${mob.hp} + ${amount}`); */
    const limit = mob.maxhp - mob.hp;
    if (amount > limit) amount = limit;
    mob.hp += amount;
    /*   console.log(`heal ${mob.hp}`); */
  }

  /**
   * Deals damage to the specified mob.
   * @param {Mob} mob - The mob to receive the damage.
   * @param {number} amount - The amount of damage to deal.
   * @param {Game} game - The game object.
   * @param {Mob | null} attacker - The mob causing the damage.
   */
  public static damage(
    mob: Mob,
    amount: number,
    game: GameState,
    attacker: Mob | null,
  ): void {
    AutoHeal.combatResets(mob, attacker, game);
    mob.hp -= amount;

    if (mob.isPlayer) game.playerDmgCount += amount;

    const involvesPlayer =
      mob.isPlayer || (attacker !== null && attacker.isPlayer);

    if (mob.hp <= 0) this.mobDies(mob, game, involvesPlayer);
  }

  /**
   * Kills the specified mob by dealing its full health as damage.
   *
   * @param {Mob} mob - The mob to be killed.
   * @param {GameState} game - The game state object.
   * @return {void} This function does not return anything.
   */
  public static killMob(mob: Mob, game: GameState): void {
    this.damage(mob, mob.hp, game, null);
  }

  /**
   * Handles the death of the specified mob.
   * @param {Mob} mob - The mob that dies.
   * @param {GameState} game - The game object.
   */
  private static mobDies(
    mob: Mob,
    game: GameState,
    involvesPlayer: boolean,
  ): void {
    const s = `${mob.name} dies.`;
    const t = <EventCategory>EventCategory.mobDeath;

    const msg = new LogMessage(s, t);
    if (involvesPlayer) {
      game.message(msg);
      game.flash(msg);
      game.addCurrentEvent(EventCategory.mobDeath);
    }
    const map = <Map>game.currentMap();
    map.removeMob(mob);
    this.maybeDropLoot(mob, game);
  }

  /**
   * Determines if loot should be dropped for the specified mob.
   *
   * @param {Mob} mob - The mob for which loot may be dropped.
   * @param {GameState} game - The game object used to determine success.
   */
  private static maybeDropLoot(mob: Mob, game: GameState): void {
    if (game.rand.isOneIn(10)) this.dropLoot(mob.pos, game, mob.level);
  }

  /**
   * Drops loot at the specified position in the game map.
   *
   * @param {WorldPoint} pos - The position where the loot will be dropped.
   * @param {GameState} game - The game object.
   * @param {number} level - The level of the loot.
   */
  private static dropLoot(
    pos: WorldPoint,
    game: GameState,
    level: number,
  ): void {
    const map = <Map>game.currentMap();
    const lootCell = map.cell(pos);
    const canDrop = EnvironmentChecker.canItemsBeDropped(lootCell);

    if (!canDrop) {
      return;
    } else {
      const rand = game.rand;
      const objectLvl = level + 1;
      const obj = ItemObjectManager.addRandomObjectForLevel(
        pos,
        map,
        rand,
        objectLvl,
      );
      const msg = new LogMessage(
        `You notice a ${obj.name()} dropping on the floor.`,
        EventCategory.drop,
      );
      game.message(msg);
    }
  }

  /**
   * Handles the event when a player takes damage.
   *
   * @param {Mob} player - The player who took damage.
   * @param {number} amount - The amount of damage taken.
   * @param {GameState} game - The current game state.
   * @return {void} This function does not return anything.
   */
  public static handlePlayerDamageEvent(
    player: Mob,
    amount: number,
    game: GameState,
  ): void {
    const damageMessage = this.getDamageMessage(player, amount);
    this.flashDamageMessage(game, damageMessage);
    this.addDamageOrDeathEvent(player, amount, game);
  }

  /**
   * Generates a damage message for a player and returns it as a LogMessage object.
   *
   * @param {Mob} player - The player who took damage.
   * @param {number} amount - The amount of damage taken.
   * @return {LogMessage} A LogMessage object containing the damage message and the playerDamage category.
   */
  private static getDamageMessage(player: Mob, amount: number): LogMessage {
    const message = this.generateDamageMessage(player, amount);
    return new LogMessage(message, EventCategory.playerDamage);
  }

  /**
   * Flashes a damage message on the game state.
   *
   * @param {GameState} game - The game state.
   * @param {LogMessage} message - The damage message.
   * @return {void} This function does not return a value.
   */
  private static flashDamageMessage(
    game: GameState,
    message: LogMessage,
  ): void {
    game.flash(message);
  }

  /**
   * Adds a damage or death event to the game state based on the player's health.
   *
   * @param {Mob} player - The player who took damage.
   * @param {number} amount - The amount of damage taken.
   * @param {GameState} game - The current game state.
   * @return {void} This function does not return anything.
   */
  private static addDamageOrDeathEvent(
    player: Mob,
    amount: number,
    game: GameState,
  ): void {
    const eventCategory = this.isFatalDamage(player, amount)
      ? EventCategory.playerDeath
      : EventCategory.playerDamage;
    game.addCurrentEvent(eventCategory);
  }

  /**
   * Determines if the given amount of damage is fatal for the mob.
   *
   * @param {Mob} mob - The mob object to check for fatal damage.
   * @param {number} amount - The amount of damage to check.
   * @return {boolean} True if the amount of damage is fatal, false otherwise.
   */
  private static isFatalDamage(mob: Mob, amount: number): boolean {
    return amount > 0 && mob.hp <= 0;
  }

  /**
   * Generates a message based on the damage percentage inflicted on the mob.
   *
   * @param {Mob} mob - The mob object taking the damage.
   * @param {number} amount - The amount of damage inflicted.
   * @return {string} The message describing the level of damage.
   */
  private static generateDamageMessage(mob: Mob, amount: number): string {
    const damagePercentage = Math.round((amount / mob.hp) * 100);
    let message = '';
    if (damagePercentage >= 100) {
      message = `Everything around you begins to fade...`;
    } else if (damagePercentage >= 75) {
      message = `You are almost being taken out by a single blow! Run!`;
    } else if (damagePercentage >= 50) {
      message = `You take some major damage! This may end badly...`;
    } else if (damagePercentage >= 25) {
      message = `You receive a major blow!`;
    } else if (damagePercentage >= 10) {
      message = `You are feeling some pain!`;
    } else {
      message = `You take a little bit of damage.`;
    }

    return message;
  }
}
