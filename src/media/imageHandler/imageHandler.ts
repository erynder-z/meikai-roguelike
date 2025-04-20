import { EventCategory } from '../../gameLogic/messages/logMessage';
import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { GameState } from '../../types/gameBuilder/gameState';
import { images } from './imageIndex';

/**
 * Handles displaying action images on the screen.
 */
export class ImageHandler {
  private static instance: ImageHandler | null = null;

  private availableImages: Record<string, string[]> = {};
  private gameConfig = gameConfigManager.getConfig();

  private constructor() {}

  /**
   * Returns the single instance of the ImageHandler class.
   * If the instance does not exist, it is created first.
   * @returns {ImageHandler} The single instance of ImageHandler.
   */
  public static getInstance(): ImageHandler {
    if (!ImageHandler.instance) {
      ImageHandler.instance = new ImageHandler();
    }
    return ImageHandler.instance;
  }

  /**
   * Returns the value of the 'data-image' attribute of the currently displayed image
   * or null if there is no displayed image.
   * @returns The value of the 'data-image' attribute or null.
   */
  private getCurrentImageDataAttribute(): string | null {
    const image = document.getElementById('image-container')
      ?.firstChild as HTMLImageElement;
    return image?.getAttribute('data-image') || null;
  }

  /**
   * Displays an image in the image container with the given type.
   * @param img The image to display.
   * @param type The type of image to display.
   */
  public displayImage(img: HTMLImageElement, type: keyof typeof EventCategory) {
    const eventName = type;

    img.setAttribute('class', 'hud-image');
    img.setAttribute('data-image', eventName);

    const imageContainer = document.getElementById('image-container');

    if (imageContainer) {
      imageContainer.innerHTML = '';
      imageContainer.appendChild(img);

      setTimeout(() => {
        img.classList.add('animation');
      }, 10);
    }
  }

  /**
   * Gets the correct image set based on the player's gender.
   * @param boyishSet The set of images for a boyish player.
   * @param girlishSet The set of images for a girlish player.
   * @returns The correct set of images.
   */
  private getImageSet<T>(boyishSet: T, girlishSet: T): T {
    return this.gameConfig.player.appearance === 'boyish'
      ? boyishSet
      : girlishSet;
  }

  /**
   * Gets an image from the available images array, repopulating the array if empty.
   * @param {string[]} fullImageSet - The full set of images for the player appearance.
   * @param {string} imageType - The type of image (e.g., 'attackImages', 'hurtImages').
   * @returns {string} The selected image to display.
   */
  private getNextImage(fullImageSet: string[], imageType: string): string {
    // Initialize available images if it doesn't exist
    if (!this.availableImages[imageType]) {
      this.availableImages[imageType] = [...fullImageSet];
    }

    // If all images have been used, repopulate the available images
    if (this.availableImages[imageType].length === 0) {
      this.availableImages[imageType] = [...fullImageSet];
    }

    // Randomly select an image
    const randomIndex = Math.floor(
      Math.random() * this.availableImages[imageType].length,
    );

    const selectedImage = this.availableImages[imageType][randomIndex];

    // Instead of splice, swap the selected image with the last one and reduce the length
    const lastIndex = this.availableImages[imageType].length - 1;
    [
      this.availableImages[imageType][randomIndex],
      this.availableImages[imageType][lastIndex],
    ] = [
      this.availableImages[imageType][lastIndex],
      this.availableImages[imageType][randomIndex],
    ];

    // Remove the last element (which is now the selected image)
    this.availableImages[imageType].length--;

    return selectedImage;
  }

  /**
   * Handles the logic for displaying an image based on the current game event.
   *
   * This function selects an appropriate image from the specified image type,
   * checks if the image should be displayed based on the current display state
   * and a random chance, and then displays the image if conditions are met.
   *
   * @param {GameState} game - The game state containing information about the current game.
   * @param {keyof typeof images} imageType - The type of images to select from (e.g., 'attackImages', 'hurtImages').
   * @param {string | null} shouldDrawImageCheck - A string to check the current image display state, or null.
   * @param {number} maybeDrawCheck - A number used to determine the likelihood of drawing the image.
   * @return {void} This function does not return anything.
   */

  private handleImageDisplay(
    game: GameState,
    imageType: keyof typeof images,
    shouldDrawImageCheck: string | null,
    maybeDrawCheck: number,
  ): void {
    const { rand } = game;
    const evt = EventCategory[
      game.log.currentEvent
    ] as keyof typeof EventCategory;

    const fullImageSet =
      imageType === 'deathImages'
        ? this.getImageSet(images['deathImages'], images['deathImages'])
        : this.getImageSet(
            (images[imageType] as { boyish: string[]; girlish: string[] })
              .boyish,
            (images[imageType] as { boyish: string[]; girlish: string[] })
              .girlish,
          );

    const shouldDrawImage =
      this.getCurrentImageDataAttribute() !== shouldDrawImageCheck;
    const maybeDrawImage =
      rand.randomIntegerClosedRange(0, maybeDrawCheck) === 0;

    if (shouldDrawImage || maybeDrawImage) {
      const nextImage = this.getNextImage(fullImageSet, imageType);
      const image = new Image();
      image.onload = () => {
        this.displayImage(image, evt);
      };

      image.src = nextImage;

      this.displayImage(image, evt);
    }

    game.log.removeCurrentEvent();
  }

  /**
   * Handles displaying an attack image for the current event.
   * @param {GameState} game - The game state containing information about the current game.
   */
  public handleAttackImageDisplay(game: GameState) {
    this.handleImageDisplay(game, 'attackImages', 'mobDamage', 2);
  }

  /**
   * Handles displaying a hurt image for the current event.
   * @param {GameState} game - The game state containing information about the current game.
   */
  public handleHurtImageDisplay(game: GameState) {
    this.handleImageDisplay(game, 'hurtImages', 'playerDamage', 3);
  }

  /**
   * Handles displaying a smile image for the current event.
   * @param {GameState} game - The game state containing information about the current game.
   */
  public handleSmileImageDisplay(game: GameState) {
    this.handleImageDisplay(game, 'smileImages', null, 0);
  }

  /**
   * Handles displaying a moving image for the current event.
   * @param {GameState} game - The game state containing information about the current game.
   */
  public handleMovingImageDisplay(game: GameState) {
    this.handleImageDisplay(game, 'movingImages', 'moving', 5);
  }

  /**
   * Handles displaying a pistol image for the current event.
   * @param {GameState} game - The game state containing information about the current game.
   */
  public handlePistolImageDisplay(game: GameState): void {
    this.handleImageDisplay(game, 'pistolImages', null, 0);
  }

  /**
   * Handles displaying a neutral image for the current event.
   *
   * @param {GameState} game - The game state containing information about the current game.
   * @return {void} This function does not return anything.
   */
  public handleNeutralImageDisplay(game: GameState): void {
    this.handleImageDisplay(game, 'neutralImages', 'wait', 3);
  }

  /**
   * Handles displaying a death image for the current event.
   * @param {GameState} game - The game state containing information about the current game.
   * @return {void} This function does not return anything.
   */
  public handleDeathImageDisplay(game: GameState): void {
    this.handleImageDisplay(game, 'deathImages', null, 0);
  }

  /**
   * Handles displaying a random image for the current level.
   *
   * @param {GameState} game - The game state containing information about the current game.
   * @return {void} This function does not return anything.
   */
  public handleLevelImageDisplay(game: GameState): void {
    const { rand } = game;
    const evt = EventCategory[
      game.log.currentEvent
    ] as keyof typeof EventCategory;
    const lvl = game.dungeon.level;

    if (lvl == null || isNaN(lvl) || lvl < 0) return;

    const levelImageMapping = [
      images.levelImages.lvlTier00Images, // Levels 0
      images.levelImages.lvlTier01Images, // Levels 1-4
      images.levelImages.lvlTier02Images, // Levels 5-8
      images.levelImages.lvlTier03Images, // Levels 9-12
      images.levelImages.lvlTier04Images, // Levels 13-16
      images.levelImages.lvlTier05Images, // Levels 17-20
      images.levelImages.lvlTier06Images, // Levels 21-24
      images.levelImages.lvlTier07Images, // Levels 25-28
      images.levelImages.lvlTier08Images, // Levels 29-32
      images.levelImages.lvlTier09Images, // Levels 33-36
    ];

    const maxLevelIndex = levelImageMapping.length - 1;
    const index = Math.min(Math.floor(lvl / 4), maxLevelIndex);
    const neutralImageSet = this.getImageSet(
      images.neutralImages.boyish,
      images.neutralImages.girlish,
    );
    const imgs = levelImageMapping[index] || neutralImageSet;

    const randomImage = rand.getRandomImageFromArray(imgs);
    const image = new Image();
    image.src = randomImage;

    this.displayImage(image, evt);
    game.log.removeCurrentEvent();
  }
}
