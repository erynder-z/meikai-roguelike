import { Buff } from '../gameLogic/buffs/buffEnum';
import messagesData from '../gameLogic/messages/messagesData/messagesData.json';

export class GrammarHandler {
  /**
   * Converts a Buff enum value to its corresponding adjective string.
   *
   * @param buff - The Buff enum value to be translated.
   * @returns The adjective form of the buff if found, otherwise null.
   */
  public static BuffToAdjective(buff: Buff): string | null {
    const buffData = messagesData.Buffs.find(b => b.buff === Buff[buff]);
    if (buffData) return buffData.adjective;
    return null;
  }
}
