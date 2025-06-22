/**
 * Returns a random color as a string in the format '#rrggbb'.
 *
 * @returns The randomly generated color.
 */
export const getRandomColor = (): string => {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, '0')}`;
};
