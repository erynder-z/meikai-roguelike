export class ValueUtils {
  /**
   * Clamps a number between 0 and 1 and rounds it to two decimal places.
   *
   * @param value The input number.
   * @return A number between 0 and 1, rounded to two decimals.
   */
  static clampToTwoDecimals(value: number): number {
    if (isNaN(value)) return 0;
    const clamped = Math.max(0, Math.min(1, value));
    return Number(clamped.toFixed(2));
  }
}
