import messages from './messages.json';

/**
 * Generates a random starting message.
 */
export class StartingMessageGenerator {
  private static messages: string[] = messages.startingMessages;

  /**
   * Gets a random starting message from the list.
   *
   * @return A random starting message.
   */
  public static getRandomMessage(): string {
    const randomIndex = Math.floor(Math.random() * this.messages.length);
    return this.messages[randomIndex];
  }
}
