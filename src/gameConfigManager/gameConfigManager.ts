import { FontHandler } from '../font/fontHandler';
import { getRandomName } from '../randomGenerator/getRandomName';
import { GameConfigType } from '../types/gameConfig/gameConfigType';
import {
  BaseDirectory,
  readTextFile,
  writeTextFile,
  mkdir,
  open,
} from '@tauri-apps/plugin-fs';

/**
 * Handles initializing and updating the game configuration that is used to create UI and build the game.
 */
class GameConfigManager {
  private static instance: GameConfigManager;
  private config: GameConfigType;
  private readonly defaultParams: GameConfigType = {
    SHOW_MENU: true,
    show_scanlines: true,
    scanline_style: 'light',
    show_images: true,
    message_display: 'left',
    message_count: 25,
    image_display: 'left',
    seed: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
    control_scheme: 'default',
    player: {
      name: getRandomName('girlish'),
      appearance: 'girlish',
      color: '#ffffff',
      avatar: '@',
    },
    blood_intensity: 1,
    min_keypress_delay: 50,
    terminal: {
      dimensions: {
        width: 64,
        height: 40,
      },
      scaling_factor: 0.8,
      font: 'DejaVu Sans Mono',
    },
  };
  private fonts: string[] = [];

  private constructor() {
    this.config = this.defaultParams;
  }

  /**
   * Gets the single instance of the GameConfigManager.
   * @returns {GameConfigManager} The single instance of the GameConfigManager.
   */
  public static getInstance(): GameConfigManager {
    if (!GameConfigManager.instance) {
      GameConfigManager.instance = new GameConfigManager();
    }
    return GameConfigManager.instance;
  }

  /**
   * Initializes the game configuration manager.
   *
   * If the configuration file (gameConfig.json) does not exist, it is created with default parameters.
   * If the configuration file does exist, it is loaded and the parameters are used to update the game
   * configuration.
   *
   * @returns {Promise<void>} A promise that resolves when the game config is successfully initialized.
   */
  public async initialize(): Promise<void> {
    try {
      // Load configuration file or use default if not found
      const params = await readTextFile('gameConfig.json', {
        baseDir: BaseDirectory.AppData,
      }).catch(async error => {
        console.error(
          'Error loading parameters or file not found, creating new file:',
          error,
        );
        await mkdir('', { baseDir: BaseDirectory.AppData, recursive: true });
        await this.saveConfig();
        return null;
      });

      if (params) {
        this.config = { ...this.config, ...JSON.parse(params) };
      } else {
        this.config = this.defaultParams;
      }

      await FontHandler.loadFonts();

      this.updateFonts();
    } catch (error) {
      console.error('Error initializing game config or loading fonts:', error);
    }
  }

  /**
   * Returns the current game configuration.
   * @returns {GameConfigType} The current game configuration.
   */
  public getConfig(): GameConfigType {
    return this.config;
  }

  /**
   * Updates the list of fonts available in the document.
   * This is called during initialization and after saving the config.
   */
  private updateFonts(): void {
    this.fonts = Array.from(document.fonts).map(fontFace => fontFace.family);
  }

  /**
   * Returns the list of font families available in the document.
   *
   * This list is updated whenever the game configuration is initialized or updated.
   * @returns {string[]} The list of font families available in the document.
   */
  public getFonts(): string[] {
    return this.fonts;
  }

  /**
   * Saves the current in-memory configuration to gameConfig.json.
   * If the file does not exist, it is created with write permissions.
   * If the file already exists, it is overwritten.
   * @returns {Promise<void>} A promise that resolves when the configuration is successfully saved.
   */
  public async saveConfig(): Promise<void> {
    try {
      const contents = JSON.stringify(this.config, null, 2);

      // Ensure file exists with write permissions
      const file = await open('gameConfig.json', {
        write: true,
        create: true,
        baseDir: BaseDirectory.AppData,
      });

      await writeTextFile('gameConfig.json', contents, {
        baseDir: BaseDirectory.AppData,
      });

      await file.close();
      console.log('Configuration saved successfully.');
    } catch (error) {
      console.error('Error saving configuration:', error);
    }
  }
}

export const gameConfigManager = GameConfigManager.getInstance();
