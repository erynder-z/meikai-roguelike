import { Mood } from '../../types/gameLogic/stats/stats';

/**
 * Manage player related stats
 */
export class Stats {
  public visibilityRange = 15;
  public currentVisibilityRange = 15;
  public turnCounter = 1;
  public mobKillCounter = 0;
  public damageDealtCounter = 0;
  public damageReceivedCounter = 0;
  public currentTurnReceivedDmg = 0;
  public damageDealModifier = 1.0;
  public damageReceiveModifier = 1.0;
  public baseStrength = 4;
  public currentStrength = 4;
  public mood: Mood = 'Normal';
  public hunger = 0.0;
  public thirst = 0.0;

  /**
   * Adjusts the default visibility range by the specified amount.
   *
   * @param amount - The amount by which to adjust the default visibility range.
   */
  public adjustVisibilityRange(amount: number): void {
    this.visibilityRange = amount;
  }

  /**
   * Adjusts the current visibility range by the given amount.
   *
   * @param amount - The amount by which to adjust the current visibility range.
   */
  public adjustCurrentVisibilityRange(amount: number): void {
    this.currentVisibilityRange = amount;
  }

  /**
   * Adjusts the current turn received damage by the given amount.
   *
   * @param dmg - The amount to adjust the current turn received damage by.
   */
  public adjustCurrentTurnReceivedDmg(dmg: number): void {
    this.currentTurnReceivedDmg += dmg;
  }

  /**
   * Resets the current turn received damage to zero.
   */
  public resetCurrentTurnReceivedDmg(): void {
    this.currentTurnReceivedDmg = 0;
  }

  /**
   * Increments the turn counter by 1.
   */
  public incrementTurnCounter(): void {
    this.turnCounter++;
  }

  /**
   * Increments the mob kill counter by 1.
   */
  public incrementMobKillCounter(): void {
    this.mobKillCounter++;
  }

  /**
   * Increments the damage dealt counter by the specified amount.
   *
   * @param dmg - The amount to increment the damage dealt counter by.
   */
  public incrementDamageDealtCounter(dmg: number): void {
    this.damageDealtCounter += dmg;
  }

  /**
   * Increments the damage received counter by the given amount.
   *
   * @param dmg - The amount to increment the damage received counter by.
   */
  public incrementDamageReceivedCounter(dmg: number): void {
    this.damageReceivedCounter += dmg;
  }

  /**
   * Adjusts the damage deal modifier by the given amount.
   *
   * @param amount - The amount to adjust the modifier by.
   */
  public adjustDamageDealModifier(amount: number): void {
    this.damageDealModifier += amount;
  }

  /**
   * Resets the damage deal modifier to 1.0, removing any temporary
   * damage increase or decrease.
   */
  public resetDamageDealModifier(): void {
    this.damageDealModifier = 1.0;
  }

  /**
   * Adjusts the damage received modifier by the given amount.
   *
   * @param amount - The amount to adjust the modifier by.
   */
  public adjustDamageReceiveModifier(amount: number): void {
    this.damageReceiveModifier += amount;
  }

  /**
   * Resets the damage received modifier to 1.0, removing any temporary
   * damage increase or decrease.
   */
  public resetDamageReceiveModifier(): void {
    this.damageReceiveModifier = 1.0;
  }

  /**
   * Sets the mood of the entity to the specified value.
   *
   * @param mood - The new mood to set for the entity.
   */
  public setMood(mood: Mood): void {
    this.mood = mood;
  }

  /**
   * Adjusts the hunger of the entity by the given amount. Ensures
   * that the hunger value stays within the range [0, 10].
   *
   * @param amount - The amount to adjust the hunger by.
   */
  public adjustHunger(amount: number): void {
    this.hunger = Math.min(10, Math.max(0, this.hunger + amount));
  }

  /**
   * Adjusts the thirst of the entity by the given amount. Ensures
   * that the thirst value stays within the range [0, 10].
   *
   * @param amount - The amount to adjust the thirst by.
   */
  public adjustThirst(amount: number): void {
    this.thirst = Math.min(10, Math.max(0, this.thirst + amount));
  }

  /**
   * Sets the currentStrength of the entity to the specified value.
   *
   * @param strength - The new strength to set for the entity.
   */
  public setCurrentStrength(strength: number): void {
    this.currentStrength = strength;
  }
}
