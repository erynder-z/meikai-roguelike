import { StartingMessageGenerator } from '../../ui/messages/startingMessageGenerator/startingMessageGenerator';
import { EventCategory, LogMessage } from './logMessage';

/**
 * The message log for storing and managing messages.
 */
export class MessageLog {
  public queue: LogMessage[] = [];
  public archive: LogMessage[] = [];
  public currentEvent: EventCategory = EventCategory.none;

  constructor() {
    const randomMessage = StartingMessageGenerator.getRandomMessage();
    this.archive.push(new LogMessage(randomMessage, EventCategory.none));
  }

  /**
   * Adds a message to the log.
   *
   * @param msg - The message to add.
   * @param isFlashMsg - True if the message is a flash message, otherwise false.
   */
  public message(msg: LogMessage, isFlashMsg: boolean): void {
    if (!isFlashMsg) this.archive.push(msg);
    if (isFlashMsg) this.queue.push(msg);
  }
  /**
   * Removes the oldest message from the queue.
   */
  public dequeue(): void {
    this.queue.shift();
  }

  /**
   * Retrieves the top message from the queue, or null if the queue is empty.
   *
   * @return The top message, or null if the queue is empty.
   */
  public top(): LogMessage | null {
    return this.empty() ? null : this.queue[0];
  }

  /**
   * Clears all messages from the queue.
   */
  public clearQueue(): void {
    this.queue = [];
  }

  /**
   * Checks if there are queued messages.
   *
   * @return True if there are queued messages, otherwise false.
   */
  public hasQueuedMessages(): boolean {
    return this.len() > 1;
  }

  /**
   * Returns the number of messages in the queue.
   *
   * @returns The number of messages in the queue.
   */
  public len(): number {
    return this.queue.length;
  }

  /**
   * Checks if the queue is empty.
   *
   * @return True if the queue is empty, otherwise false.
   */
  public empty(): boolean {
    return !this.queue.length;
  }

  /**
   * Sets the current event in the message log to the specified event category.
   *
   * @param evt - The event category to set as the current event.
   */
  public addCurrentEvent(evt: EventCategory): void {
    this.currentEvent = evt;
  }

  /**
   * Removes the current event by setting it to a new LogMessage with an empty message and unknown category.
   */
  public removeCurrentEvent(): void {
    this.currentEvent = EventCategory.none;
  }
}
