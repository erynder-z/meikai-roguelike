import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { ImageHandler } from '../../media/imageHandler/imageHandler';
import { images } from '../../media/imageHandler/imageIndex';
import { MessagesDisplay } from '../messages/messagesDisplay';
import { MessageLog } from '../../gameLogic/messages/messageLog';

/**
 *  This class handles changing and redrawing parts of the UI when needed.
 */
export class LayoutManager {
  private mainContainer: HTMLElement | null;
  private bottomContainer: HTMLElement | null;
  private imageContainer: HTMLElement | null;
  private gameConfig = gameConfigManager.getConfig();

  constructor() {
    this.mainContainer = document.getElementById('main-container');
    this.bottomContainer = document.getElementById('bottom-container');
    this.imageContainer = document.getElementById('image-container');
  }

  /**
   * Sets the message display layout within the container.
   *
   * @param {('left' | 'right')} position - The desired position of the message display.
   */
  public setMessageDisplayLayout(position: 'left' | 'right'): void {
    if (!this.mainContainer) return;

    const layout = this.getMessageDisplayLayout(position);
    this.mainContainer.style.gridTemplateColumns = layout.columns;
    this.mainContainer.style.gridTemplateAreas = layout.areas;
  }

  /**
   * Sets the image display layout within the bottom container.
   *
   * @param {('left' | 'right')} position - The desired position of the image display.
   */
  public setImageDisplayLayout(position: 'left' | 'right'): void {
    if (!this.bottomContainer || !this.imageContainer) return;

    const layout = this.getImageDisplayLayout(position);
    this.bottomContainer.style.gridTemplateColumns = layout.columns;
    this.bottomContainer.style.gridTemplateAreas = layout.areas;
    this.imageContainer.style.justifyContent = layout.justifyContent;
  }

  /**
   * Sets the display property of the image container.
   *
   * @param {boolean} shouldShow - Determines whether the image container should be visible ('block') or hidden ('none').
   */
  public setImageDisplay(shouldShow: boolean): void {
    if (!this.imageContainer) return;
    this.imageContainer.style.display = shouldShow ? 'block' : 'none';
  }

  /**
   * Forces the display of a smile image.
   */
  public forceSmileImageDisplay(): void {
    const appearance = this.gameConfig.player.appearance;

    const smileImageSet =
      appearance === 'boyish'
        ? images.smileImages.boyish
        : images.smileImages.girlish;

    const randomImage =
      smileImageSet[Math.floor(Math.random() * smileImageSet.length)];

    const imageHandler = ImageHandler.getInstance();
    const image = new Image();
    image.src = randomImage;
    imageHandler.renderImage(image, 'none');
  }

  /**
   * Resets both message and image display layouts to the default (left side).
   */
  public resetLayouts(): void {
    this.setMessageDisplayLayout('left');
    this.setImageDisplayLayout('left');
  }

  /**
   * Returns the grid layout configuration for the message panel.
   *
   * @param {('left' | 'right')} position - The message panel position.
   * @return {{ columns: string, areas: string }}
   */
  private getMessageDisplayLayout(position: 'left' | 'right'): {
    columns: string;
    areas: string;
  } {
    if (position === 'left') {
      return {
        columns: '15% 85%',
        areas: `
          'misc-info misc-info'
          'messages canvas'
          'bottom bottom'
        `,
      };
    } else {
      return {
        columns: '85% 15%',
        areas: `
          'misc-info misc-info'
          'canvas messages'
          'bottom bottom'
        `,
      };
    }
  }

  /**
   * Returns the grid layout configuration for the image panel.
   *
   * @param {('left' | 'right')} position - The image panel position.
   * @return {{ columns: string, areas: string, justifyContent: string }}
   */
  private getImageDisplayLayout(position: 'left' | 'right'): {
    columns: string;
    areas: string;
    justifyContent: string;
  } {
    if (position === 'left') {
      return {
        columns: '15% 25% 60%',
        areas: `'image buffs equipment'`,
        justifyContent: 'flex-start',
      };
    } else {
      return {
        columns: '25% 60% 15%',
        areas: `'buffs equipment image'`,
        justifyContent: 'flex-end',
      };
    }
  }

  /**
   * Updates the messages display with the current current message count.
   * @param {MessageLog} log - The message log to read from.
   */
  public redrawMessages(log: MessageLog): void {
    const messageCount = this.gameConfig.message_count;
    const messageLog = log.archive.slice(-messageCount);

    const messagesDisplay = document.querySelector(
      'messages-display',
    ) as MessagesDisplay;
    if (messagesDisplay) messagesDisplay.setMessages(messageLog);
  }

  /**
   * Updates the global CSS variable `--game-font` with the current terminal font from the game config.
   */
  public updateFont(): void {
    document.documentElement.style.setProperty(
      '--game-font',
      `"${this.gameConfig.terminal.font}"`,
    );
  }
}
