import corpseData from '../../gameLogic/mobs/mobData/corpses.json';
import envData from '../../gameLogic/environment/environmentData/environment.json';
import { FlashDecorator } from './flashDecorator';
import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import itemData from '../../gameLogic/itemObjects/itemData/items.json';
import { LogMessage } from '../../gameLogic/messages/logMessage';
import mobData from '../../gameLogic/mobs/mobData/mobs.json';
import { MessageLog } from '../../gameLogic/messages/messageLog';

export class FlashDisplay extends HTMLElement {
  private decorator: FlashDecorator;
  private gameConfig = gameConfigManager.getConfig();
  constructor() {
    super();
    const shadowRoot = this.attachShadow({ mode: 'open' });

    this.decorator = new FlashDecorator(shadowRoot);
  }

  /**
   * Sets up the element's shadow root and styles it with a template.
   * This method is called when the element is inserted into the DOM.
   * It is called after the element is created and before the element is connected
   * to the DOM.
   */
  connectedCallback(): void {
    const templateElement = document.createElement('template');
    templateElement.innerHTML = `
      <style>
        * {
          margin: var(--margin);
          padding: var(--padding);
          box-sizing: var(--box-sizing);
        }
        * {
          scrollbar-width: var(--scrollbar-width);
          scrollbar-color: var(--scrollbar-foreground) var(--scrollbar-background);
        }
        ::selection {
          color: var(--selection-color);
          background-color: var(--selection-background);
        }
        .flash-display {
          background: var(--popupBackground);
          position: absolute;
          bottom: 0;
          left: 0;
          padding: 0.5rem;
          border-radius: 1rem;
          color: var(--white);
        }
        .more-span {
          font-weight: bold;
        }
      </style>
      <div class="flash-display"></div>
    `;

    this.shadowRoot?.appendChild(templateElement.content.cloneNode(true));
  }

  /**
   * Sets the flash message display.
   *
   * @param msgs - The messages to set.
   * @param log - The message log to check for queued messages.
   */
  public setFlash(msgs: LogMessage[], log: MessageLog): void {
    const flashDisplay = this.shadowRoot?.querySelector(
      '.flash-display',
    ) as HTMLElement;

    if (flashDisplay) {
      // Only display if at least one message has content.
      const hasContent = msgs.some(msg => msg.message !== '');
      flashDisplay.style.visibility = hasContent ? 'visible' : 'hidden';
      flashDisplay.innerHTML = '';

      const fragment = document.createDocumentFragment();

      msgs.forEach((msg, index) => {
        if (msg.message !== '') {
          const textNode = document.createTextNode(msg.message);
          fragment.appendChild(textNode);
          // Insert a line break between messages (if not the last message)
          if (index < msgs.length - 1) {
            fragment.appendChild(document.createElement('br'));
          }
        }
      });

      this.decorateFlashDisplay(fragment, log);
      flashDisplay.appendChild(fragment);
    }
  }

  /**
   * Decorates the given DocumentFragment with colored names and a message
   * indicating if there are more messages queued.
   *
   * @param fragment - The fragment to modify.
   * @param log - The message log to check for queued messages.
   */
  private decorateFlashDisplay(
    fragment: DocumentFragment,
    log: MessageLog,
  ): void {
    this.decorator.createStyles(itemData.items, 'item');
    this.decorator.createStyles(corpseData.corpses, 'corpse');
    this.decorator.createStyles(mobData.mobs, 'mob');
    this.decorator.createStyles(envData.environment, 'env');
    this.decorator.createStyles(this.gameConfig.player.color);

    this.decorator.colorize(fragment, itemData.items, 'item');
    this.decorator.colorize(fragment, corpseData.corpses, 'corpse');
    this.decorator.colorize(fragment, mobData.mobs, 'mob');
    this.decorator.colorize(fragment, envData.environment, 'env');
    this.decorator.colorize(fragment, this.gameConfig.player.name);

    if (log.hasQueuedMessages())
      // More than 1 message in queue
      this.decorator.addMoreSpanToFragment(fragment, log);
  }

  /**
   * Clears the flash message display.
   *
   * @param game - The game state.
   */
  public clearFlash(game: GameState): void {
    game.log.clearQueue();

    const flashDisplay = this.shadowRoot?.querySelector(
      '.flash-display',
    ) as HTMLElement;

    if (flashDisplay) {
      flashDisplay.style.visibility = 'hidden';
      flashDisplay.innerHTML = '';
    }
  }
}
