import messagesData from '../../gameLogic/messages/messagesData/messagesData.json';

type BuffText = {
  buff: string;
  textColor: string;
  noun: string;
  adjective: string;
};

/**
 * Represents a helper class that provides methods for coloring buff text.
 */
export class BuffColors {
  public buffRegex: RegExp;
  public buffLookup: { [key: string]: BuffText };

  constructor() {
    const buffs = messagesData.Buffs as BuffText[];
    this.buffRegex = this.createBuffRegex(buffs);
    this.buffLookup = this.createBuffLookup(buffs);
  }

  /**
   * Replaces occurrences of buffs in the innerHTML of the given element with
   * colored spans.
   *
   * @param element - The element to modify.
   */
  public colorBuffs(element: HTMLElement): void {
    element.innerHTML = element.innerHTML.replace(this.buffRegex, match => {
      const buff = this.buffLookup[match];
      return buff
        ? `<span style="color: ${buff.textColor}">${match}</span>`
        : match;
    });
  }

  /**
   * Generates a regular expression that matches any occurrence of the buff words in the given array of BuffText objects.
   *
   * @param buffs - The array of BuffText objects containing buff words.
   * @return The regular expression that matches any occurrence of the buff words.
   */
  private createBuffRegex(buffs: BuffText[]): RegExp {
    const buffWords: string[] = [];

    buffs.forEach(buff => {
      if (buff.adjective) buffWords.push(buff.adjective);
      if (buff.buff) buffWords.push(buff.buff);
      if (buff.noun) buffWords.push(buff.noun);
    });

    return new RegExp(`\\b(${buffWords.join('|')})\\b`, 'g');
  }

  /**
   * Creates a lookup object for buff texts based on the given buff texts array.
   *
   * @param buffs - An array of buff texts.
   * @return A lookup object where the keys are the buff words and the values are the corresponding buff texts.
   */
  private createBuffLookup(buffs: BuffText[]): { [key: string]: BuffText } {
    const lookup: { [key: string]: BuffText } = {};

    buffs.forEach(buff => {
      if (buff.adjective) lookup[buff.adjective] = buff;
      if (buff.buff) lookup[buff.buff] = buff;
      if (buff.noun) lookup[buff.noun] = buff;
    });

    return lookup;
  }
}
