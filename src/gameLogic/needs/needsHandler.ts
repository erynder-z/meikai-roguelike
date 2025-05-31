import { Buff } from '../buffs/buffEnum';
import { BuffCommand } from '../commands/buffCommand';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameState } from '../../types/gameBuilder/gameState';
import { HealthAdjust } from '../commands/healthAdjust';
import { Mob } from '../mobs/mob';

type NeedConfig = {
  type: string;
  getLevel: (game: GameState) => number;
  thresholds: [number, number, number, number]; // low, medium, high, max
  damageMessage: string;
  damageCategory: EventCategory;
  confuseMessage: string;
  // Add a category for confusion if different, otherwise can reuse damageCategory
  // confuseCategory: EventCategory;
};

// Default configurations for player needs. This could be made more dynamic if needed.
const needsConfigDefaults: NeedConfig[] = [
  {
    type: 'hunger',
    getLevel: (game: GameState) => game.stats.hunger,
    thresholds: [4, 6, 8, 10], // Represents 40%, 60%, 80%, 100% if max is 10
    damageMessage: 'You are too hungry and take {damage} damage!',
    damageCategory: EventCategory.hungerDamage,
    confuseMessage: "You feel like you're going crazy from hunger!",
  },
  {
    type: 'thirst',
    getLevel: (game: GameState) => game.stats.thirst,
    thresholds: [4, 6, 8, 10], // Represents 40%, 60%, 80%, 100% if max is 10
    damageMessage: 'You are too thirsty and take {damage} damage!',
    damageCategory: EventCategory.thirstDamage,
    confuseMessage: "You feel like you're going crazy from thirst!",
  },
];

/**
 * Handles various needs of the player, such as hunger and thirst,
 * including their increase and effects on the player.
 */
export class NeedsHandler {
  constructor() {}

  /**
   * Increases the hunger level of the player by a small fixed amount.
   * Ensures that the hunger level does not exceed the maximum threshold.
   *
   * @param {GameState} game - The current state of the game.
   * @return {void} This function does not return a value.
   */
  public increaseHunger(game: GameState): void {
    const increaseAmount = 0.02; // Corresponds to 1 point per 50 turns
    const MAX_HUNGER = 10.0;
    game.stats.hunger = Math.min(
      MAX_HUNGER,
      parseFloat((game.stats.hunger + increaseAmount).toFixed(2)),
    );
  }

  /**
   * Increases the thirst level of the player by a small fixed amount.
   * Ensures that the thirst level does not exceed the maximum threshold.
   *
   * @param {GameState} game - The current state of the game.
   * @return {void} This function does not return a value.
   */
  public increaseThirst(game: GameState): void {
    const increaseAmount = 0.04; // Corresponds to 1 point per 25 turns
    const MAX_THIRST = 10.0;
    game.stats.thirst = Math.min(
      MAX_THIRST,
      parseFloat((game.stats.thirst + increaseAmount).toFixed(2)),
    );
  }

  /**
   * Processes the player's needs, increasing them and applying any resultant effects
   * such as damage, status ailments, and strength reduction.
   *
   * @param {GameState} game - The current game state.
   * @param {Mob} player - The player mob.
   */
  public processPlayerNeeds(game: GameState, player: Mob): void {
    this.increaseHunger(game);
    this.increaseThirst(game);

    const reductionPerThreshold = 0.2;
    let totalStrengthReductionFactor = 0.0;
    const damageAtHighThreshold = 1;
    let confuseAppliedThisTurn = false;

    for (const need of needsConfigDefaults) {
      const currentLevel = need.getLevel(game);
      let reductionForThisNeed = 0.0;

      // Low threshold effects
      if (currentLevel >= need.thresholds[0]) {
        reductionForThisNeed += reductionPerThreshold;
      }
      // Medium threshold effects
      if (currentLevel >= need.thresholds[1]) {
        reductionForThisNeed += reductionPerThreshold;
      }
      // High threshold effects
      if (currentLevel >= need.thresholds[2]) {
        reductionForThisNeed += reductionPerThreshold;

        HealthAdjust.damage(player, damageAtHighThreshold, game, null);
        game.message(
          new LogMessage(
            need.damageMessage.replace('{damage}', `${damageAtHighThreshold}`),
            need.damageCategory,
          ),
        );
      }
      // Max threshold effects
      if (currentLevel >= need.thresholds[3] && !confuseAppliedThisTurn) {
        const duration = 1;

        new BuffCommand(Buff.Confuse, player, game, player, duration).execute();

        game.message(new LogMessage(need.confuseMessage, need.damageCategory));
        confuseAppliedThisTurn = true;
      }
      totalStrengthReductionFactor += reductionForThisNeed;
    }

    const minimumStrengthMultiplier = 0.4;
    const strengthMultiplier = Math.max(
      minimumStrengthMultiplier,
      1.0 - totalStrengthReductionFactor,
    );

    const newStrength = Math.ceil(game.stats.baseStrength * strengthMultiplier);
    game.stats.currentStrength = newStrength;
  }

  /**
   * Logs the current hunger and thirst levels to the console.
   * @param {GameState} game - The current state of the game.
   */
  public log(game: GameState): void {
    console.log(`Hunger: ${game.stats.hunger}`);
    console.log(`Thirst: ${game.stats.thirst}`);
  }
}
