import { GameState } from '../../shared-types/gameBuilder/gameState';
import { GameMapType } from '../../shared-types/gameLogic/maps/mapModel/gameMapType';
import { Buff } from '../buffs/buffEnum';
import { BuffCommand } from '../commands/buffCommand';
import { HealthAdjust } from '../commands/healthAdjust';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { Mob } from '../mobs/mob';

type NeedConfig = {
  type: string;
  getLevel: (game: GameState) => number;
  thresholds: [number, number, number, number]; // low, medium, high, max
  damageMessage: string;
  damageCategory: EventCategory;
  confuseMessage: string;
};

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
   * Increases the player's hunger level by a small amount.
   * The rate of increase is set to 0.005, which corresponds to 1 point per 200 turns.
   * The hunger level is capped at a maximum value of 10.0 to prevent overflow.
   *
   * @param game - The game object that contains the player's stats.
   */
  public increaseHunger(game: GameState): void {
    const baseIncreaseAmount = 0.005; // Corresponds to 1 point per 200 turns
    const MAX_HUNGER = 10.0;
    game.stats.hunger = Math.min(
      MAX_HUNGER,
      parseFloat((game.stats.hunger + baseIncreaseAmount).toFixed(2)),
    );
  }

  /**
   * Increases the player's thirst level based on the current map's temperature.
   * The thirst level increases at a base rate, with the rate accelerating if
   * the temperature exceeds a specified threshold. Higher temperatures result
   * in a faster increase of thirst. The thirst level is capped at a maximum
   * value to prevent overflow.
   *
   * @param currentMap - The current map providing context, including temperature.
   * @param game - The current game state, which includes player stats.
   */
  public increaseThirst(currentMap: GameMapType, game: GameState): void {
    const currentTemperature = currentMap.temperature;
    const baseIncreaseAmount = 0.01; // Corresponds to 1 point per 100 turns
    const MAX_THIRST = 10.0;
    const temperatureThreshold = 20; // A temperature above this threshold accelerates thirst
    // Thirst is more sensitive to heat. 0.01 means a 1% increase per degree.
    const thirstTemperatureMultiplier = 0.01;

    let actualIncreaseAmount = baseIncreaseAmount;

    if (currentTemperature > temperatureThreshold) {
      const temperatureDifference = currentTemperature - temperatureThreshold;
      const temperatureFactor =
        1 + temperatureDifference * thirstTemperatureMultiplier;
      actualIncreaseAmount *= temperatureFactor;
    }

    game.stats.thirst = Math.min(
      MAX_THIRST,
      parseFloat((game.stats.thirst + actualIncreaseAmount).toFixed(2)),
    );
  }

  /**
   * Handles all effects of the player's needs, including:
   * - Increasing the levels of the needs over time
   * - Reducing the player's strength based on the levels of the needs
   * - Damaging the player if the needs are high enough
   * - Confusing the player if the needs are extremely high
   *
   * @param game - The current game state.
   * @param player - The player mob.
   */
  public processPlayerNeeds(game: GameState, player: Mob): void {
    const currentMap = game.dungeon.currentMap(game);
    this.increaseHunger(game);
    this.increaseThirst(currentMap, game);

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
   * @param game - The current state of the game.
   */
  public log(game: GameState): void {
    console.log(`Hunger: ${game.stats.hunger}`);
    console.log(`Thirst: ${game.stats.thirst}`);
  }
}
