import { LogMessage } from '../gameLogic/messages/logMessage';
import { MessageLog } from '../gameLogic/messages/messageLog';

/**
 * Returns the last two messages from the game log.
 * @param log - The game log.
 * @returns The last two messages from the game log.
 */
export const handleLastMoments = (log: MessageLog): LogMessage[] => {
  const messageCount = 2;
  const lastMessages = log.archive.slice(-messageCount);
  return lastMessages;
};
