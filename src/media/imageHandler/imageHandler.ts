import { EventCategory } from '../../gameLogic/messages/logMessage';
import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { GameState } from '../../types/gameBuilder/gameState';
import { images } from './imageIndex';
import { MovementDirection } from '../../types/gameLogic/commands/movementDirections';

/**
 * Singleton throttle-based image display helper
 */
class ThrottledImageHandler {
  private static instance: ThrottledImageHandler;
  private currentImg: HTMLImageElement | null = null;
  private nextImgInfo: {
    img: HTMLImageElement;
    type: keyof typeof EventCategory;
  } | null = null;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private readonly minDisplayTime = 250;

  private constructor() {}

  public static getInstance(): ThrottledImageHandler {
    if (!ThrottledImageHandler.instance) {
      ThrottledImageHandler.instance = new ThrottledImageHandler();
    }
    return ThrottledImageHandler.instance;
  }

  /**
   * Queues an image to be displayed. If no image is currently being displayed,
   * the provided image will be shown immediately. Otherwise, it will be stored
   * as the next image to display after the current image's display time expires.
   *
   * @param img - The HTMLImageElement to be displayed.
   * @param type - The type of event category associated with the image.
   */

  public queue(img: HTMLImageElement, type: keyof typeof EventCategory) {
    if (!this.currentImg) {
      this.show(img, type);
      this.startTimer();
    } else {
      this.nextImgInfo = { img, type };
    }
  }

  /**
   * Displays the provided image by setting its class and data attributes,
   * clearing the current contents of the image container, and appending
   * the image to the container.
   *
   * @param img - The HTMLImageElement to be displayed.
   * @param type - The type of event category associated with the image.
   */

  private show(img: HTMLImageElement, type: keyof typeof EventCategory) {
    img.className = 'hud-image';
    img.setAttribute('data-image', type);
    const container = document.getElementById('image-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(img);
    }
    this.currentImg = img;
  }

  /**
   * Starts the timer for hiding the current image. If the timer is already running,
   * this function does nothing. Otherwise, it sets the timer to call onTimer after
   * the configured minimum display time.
   */
  private startTimer() {
    if (this.timerId !== null) return;
    this.timerId = setTimeout(() => this.onTimer(), this.minDisplayTime);
  }

  /**
   * Called when the timer started with startTimer() fires.
   *
   * If there is a next image to display, it will be shown and the timer will be restarted.
   * Otherwise, the timer will be cleared and the currentImg property will be set to null.
   */
  private onTimer() {
    if (this.nextImgInfo) {
      const { img, type } = this.nextImgInfo;
      this.nextImgInfo = null;
      this.show(img, type);
      this.timerId = setTimeout(() => this.onTimer(), this.minDisplayTime);
    } else {
      clearTimeout(this.timerId!);
      this.timerId = null;
      this.currentImg = null;
    }
  }
}

/**
 * Handles displaying action images on the screen.
 */
export class ImageHandler {
  private static instance: ImageHandler | null = null;
  private availableImages: Record<string, string[]> = {};
  private gameConfig = gameConfigManager.getConfig();
  private throttle = ThrottledImageHandler.getInstance();

  private constructor() {}

  public static getInstance(): ImageHandler {
    if (!ImageHandler.instance) {
      ImageHandler.instance = new ImageHandler();
    }
    return ImageHandler.instance;
  }

  /**
   * Gets the current image data attribute, which is a string indicating the type of the currently displayed image.
   * Returns null if there is no image displayed.
   */
  private getCurrentImageDataAttribute(): string | null {
    const image = document.getElementById('image-container')
      ?.firstChild as HTMLImageElement;
    return image?.getAttribute('data-image') || null;
  }

  /**
   * Renders an image on the screen.
   *
   * Sets the class of the image to 'hud-image' and the data-image attribute to the provided type.
   * If there is an element with the id 'image-container', it will be cleared and the img element
   * will be appended to it.
   *
   * @param {HTMLImageElement} img - The image to be rendered.
   * @param {keyof typeof EventCategory} type - The type of the image to be rendered.
   */
  public renderImage(img: HTMLImageElement, type: keyof typeof EventCategory) {
    img.setAttribute('class', 'hud-image');
    img.setAttribute('data-image', type);
    const imageContainer = document.getElementById('image-container');
    if (imageContainer) {
      imageContainer.innerHTML = '';
      imageContainer.appendChild(img);
    }
  }

  /**
   * Gets the set of images to use based on the player's appearance.
   * If the player is 'boyish', the boyish set will be returned.
   * Otherwise, the girlish set will be returned.
   *
   * @param {T} boyishSet - The set of images to use if the player is 'boyish'.
   * @param {T} girlishSet - The set of images to use if the player is 'girlish'.
   * @returns {T} The set of images to use.
   */
  private getImageSet<T>(boyishSet: T, girlishSet: T): T {
    return this.gameConfig.player.appearance === 'boyish'
      ? boyishSet
      : girlishSet;
  }

  /**
   * Returns a random image from the set of available images of the given type, removes it from the set,
   * and returns it.
   *
   * If there are no images left in the set, it will be reset to the full set of images.
   *
   * @param {string[]} fullImageSet - The full set of images to draw from.
   * @param {string} imageType - The type of image to get.
   * @returns {string} A random image from the set of available images.
   */
  private getNextImage(fullImageSet: string[], imageType: string): string {
    if (!this.availableImages[imageType]) {
      this.availableImages[imageType] = [...fullImageSet];
    }
    if (this.availableImages[imageType].length === 0) {
      this.availableImages[imageType] = [...fullImageSet];
    }
    const randomIndex = Math.floor(
      Math.random() * this.availableImages[imageType].length,
    );
    const selectedImage = this.availableImages[imageType][randomIndex];
    const lastIndex = this.availableImages[imageType].length - 1;
    [
      this.availableImages[imageType][randomIndex],
      this.availableImages[imageType][lastIndex],
    ] = [
      this.availableImages[imageType][lastIndex],
      this.availableImages[imageType][randomIndex],
    ];
    this.availableImages[imageType].length--;
    return selectedImage;
  }

  /**
   * Handles displaying an image on the screen in response to a game event.
   * The image is chosen from the set of available images of the given type,
   * and is only displayed if the current image on the screen is not of the same type.
   *
   * The function is passed the current game state, the type of image to display,
   * and a string indicating whether the image should be displayed or not.
   * If the string is not null, then the image will only be displayed if the current image
   * on the screen does not have the same string as its data-image attribute.
   *
   * The function will remove the current event from the game log after it has been called.
   *
   * @param {GameState} game - The current game state.
   * @param {keyof typeof images} imageType - The type of image to display.
   * @param {string | null} shouldDrawImageCheck - The string indicating whether the image should be displayed or not.
   */
  private queueEventImage(
    game: GameState,
    imageType: keyof typeof images,
    shouldDrawImageCheck: string | null,
  ): void {
    const evt = EventCategory[
      game.log.currentEvent
    ] as keyof typeof EventCategory;

    const fullImageSet =
      imageType === 'deathImages'
        ? this.getImageSet(images.deathImages, images.deathImages)
        : this.getImageSet(
            (images[imageType] as { boyish: string[]; girlish: string[] })
              .boyish,
            (images[imageType] as { boyish: string[]; girlish: string[] })
              .girlish,
          );

    const shouldDrawImage =
      this.getCurrentImageDataAttribute() !== shouldDrawImageCheck;

    if (shouldDrawImage) {
      const nextImageUrl = this.getNextImage(fullImageSet, imageType);
      const image = new Image();
      image.onload = () => {
        this.throttle.queue(image, evt);
      };
      image.src = nextImageUrl;
    }

    game.log.removeCurrentEvent();
  }

  public handleAttackImageDisplay(game: GameState) {
    this.queueEventImage(game, 'attackImages', 'mobDamage');
  }

  public handleHurtImageDisplay(game: GameState) {
    this.queueEventImage(game, 'hurtImages', 'playerDamage');
  }

  public handleSmileImageDisplay(game: GameState): void {
    this.queueEventImage(game, 'smileImages', null);
  }

  public handleMovingImageDisplay(
    game: GameState,
    direction: MovementDirection,
  ): void {
    this.queueEventImage(game, 'movingImages', `moving_${direction}`);
  }

  public handlePistolImageDisplay(game: GameState): void {
    this.queueEventImage(game, 'pistolImages', null);
  }

  public handleNeutralImageDisplay(game: GameState): void {
    this.queueEventImage(game, 'neutralImages', 'wait');
  }

  public handleDeathImageDisplay(game: GameState): void {
    this.queueEventImage(game, 'deathImages', null);
  }

  public handleLevelImageDisplay(game: GameState): void {
    const { rand } = game;
    const evt = EventCategory[
      game.log.currentEvent
    ] as keyof typeof EventCategory;
    const lvl = game.dungeon.level;
    if (lvl == null || isNaN(lvl) || lvl < 0) return;

    const levelImageMapping = [
      images.levelImages.lvlTier00Images,
      images.levelImages.lvlTier01Images,
      images.levelImages.lvlTier02Images,
      images.levelImages.lvlTier03Images,
      images.levelImages.lvlTier04Images,
      images.levelImages.lvlTier05Images,
      images.levelImages.lvlTier06Images,
      images.levelImages.lvlTier07Images,
      images.levelImages.lvlTier08Images,
      images.levelImages.lvlTier09Images,
    ];
    const maxLevelIndex = levelImageMapping.length - 1;
    const index = Math.min(Math.floor(lvl / 4), maxLevelIndex);
    const neutralImageSet = this.getImageSet(
      images.neutralImages.boyish,
      images.neutralImages.girlish,
    );
    const imgs = levelImageMapping[index] || neutralImageSet;

    const image = new Image();
    image.onload = () => {
      this.throttle.queue(image, evt);
    };
    image.src = rand.getRandomImageFromArray(imgs);

    game.log.removeCurrentEvent();
  }
}
