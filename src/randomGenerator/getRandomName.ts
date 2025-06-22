import nameData from './randomPlayerNames.json';

/**
 * Returns a random name based on the given appearance.
 *
 * @param appearance - The appearance of the person for which a name is to be generated.
 * @return The randomly selected name.
 */
export const getRandomName = (appearance: 'boyish' | 'girlish'): string => {
  const nameList =
    appearance === 'boyish' ? nameData.boyishNames : nameData.girlishNames;
  const randomIndex = Math.floor(Math.random() * nameList.length);
  return nameList[randomIndex];
};
