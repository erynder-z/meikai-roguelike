import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';

/**
 * Handles displaying and converting temperature and depth units.
 * Internally, the game uses "celsius" and "meters" for temperature and depth, respectively, so Fahrenheit and feet conversion is only handled for the display.
 */
export class UnitSettingsManager {
  private static TEMP_UNIT_MAP = {
    celsius: 'C',
    fahrenheit: 'F',
  };

  private static DEPTH_UNIT_MAP = {
    meters: 'm',
    feet: 'ft',
  };

  private static WEIGHT_UNIT_MAP = {
    kilograms: 'kg',
    pounds: 'lb',
  };

  private currentTempUnit: 'celsius' | 'fahrenheit';
  private currentDepthUnit: 'meters' | 'feet';

  private currentWeightUnit: 'kilograms' | 'pounds';

  constructor() {
    const gameConfig = gameConfigManager.getConfig();
    this.currentTempUnit = gameConfig.temperature_unit;
    this.currentDepthUnit = gameConfig.depth_unit;
    this.currentWeightUnit = gameConfig.weight_unit;
  }

  /**
   * Sets the current temperature unit.
   *
   * @param unit The new temperature unit ('celsius' or 'fahrenheit').
   */
  public setCurrentTempUnit(unit: 'celsius' | 'fahrenheit'): void {
    this.currentTempUnit = unit;
  }

  /**
   * Sets the current depth unit.
   *
   * @param unit The new depth unit ('meters' or 'feet').
   */
  public setCurrentDepthUnit(unit: 'meters' | 'feet'): void {
    this.currentDepthUnit = unit;
  }

  /**
   * Sets the current weight unit.
   *
   * @param unit The new weight unit ('kilograms' or 'pounds').
   */
  public setCurrentWeightUnit(unit: 'kilograms' | 'pounds'): void {
    this.currentWeightUnit = unit;
  }

  /**
   * Converts a temperature from Celsius to Fahrenheit.
   *
   * @param celsius The temperature in Celsius.
   * @returns The temperature in Fahrenheit.
   */
  private convertCelsiusToFahrenheit(celsius: number): number {
    return celsius * (9 / 5) + 32;
  }

  /**
   * Converts a depth from meters to feet.
   *
   * @param meters The depth in meters.
   * @returns The depth in feet.
   */
  private convertMetersToFeet(meters: number): number {
    return meters * 3.28084;
  }

  /**
   * Converts a weight from kilograms to pounds.
   *
   * @param kilograms The weight in kilograms.
   * @returns The weight in pounds.
   */
  private convertKilogramsToPounds(kilograms: number): number {
    return kilograms * 2.20462;
  }

  /**
   * Converts a temperature from Celsius to the currently set unit.
   *
   * @param temperature The temperature in Celsius.
   * @returns The temperature in the current unit.
   */
  private convertTemperature(temperature: number): number {
    return this.currentTempUnit === 'fahrenheit'
      ? this.convertCelsiusToFahrenheit(temperature)
      : temperature;
  }

  /**
   * Converts a depth from meters to the currently set unit.
   *
   * @param depth The depth in meters.
   * @returns The depth in the current unit.
   */
  private convertDepth(depth: number): number {
    return this.currentDepthUnit === 'feet'
      ? this.convertMetersToFeet(depth)
      : depth;
  }

  /**
   * Converts a weight from kilograms to the currently set unit.
   *
   * @param weight The weight in kilograms.
   * @returns The weight in the current unit.
   */
  private convertWeight(weight: number): number {
    return this.currentWeightUnit === 'pounds'
      ? this.convertKilogramsToPounds(weight)
      : weight;
  }

  /**
   * Displays a temperature with the currently set unit.
   *
   * @param temperature - The temperature in Celsius.
   * @return The temperature in the current unit.
   */
  public displayTemperature(temperature: number): string {
    const convertedTemperature = Math.round(
      this.convertTemperature(temperature),
    );
    const displayUnit =
      UnitSettingsManager.TEMP_UNIT_MAP[this.currentTempUnit] || 'C';
    return `${convertedTemperature}°${displayUnit}`;
  }

  /**
   * Displays a depth with the currently set unit.
   *
   * @param depth - The depth in meters.
   * @return The depth in the current unit with the appropriate unit symbol.
   */
  public displayDepth(depth: number): string {
    const convertedDepth = Math.round(this.convertDepth(depth));
    const displayUnit =
      UnitSettingsManager.DEPTH_UNIT_MAP[this.currentDepthUnit] || 'm';
    return `${convertedDepth}${displayUnit}`;
  }

  /**
   * Displays a weight with the currently set unit.
   *
   * @param weight - The weight in kilograms.
   * @return The weight in the current unit with the appropriate unit symbol.
   */
  public displayWeight(weight: number): string {
    const convertedWeight = Math.round(this.convertWeight(weight)).toFixed(2);
    const displayUnit =
      UnitSettingsManager.WEIGHT_UNIT_MAP[this.currentWeightUnit] || 'kg';
    return `${convertedWeight} ${displayUnit}`;
  }
}
