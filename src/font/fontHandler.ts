import { gameConfigManager } from '../gameConfigManager/gameConfigManager';
import { invoke } from '@tauri-apps/api/core';
import { readFile } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';

type FontInfo = {
  name: string;
  path: string;
};

/**
 * Utility class for loading ttf-fonts from a directory and making it usable by the game.
 */
export class FontHandler {
  private static fonts: FontInfo[] = [];

  /**
   * Loads all fonts from the fonts directory in the app data directory.
   * Also applies the selected font.
   *
   * @returns A promise that resolves when all fonts are loaded.
   */
  static async loadFonts(): Promise<void> {
    const appDataPath = await appDataDir();
    const fontsDirectory = `${appDataPath.endsWith('/') ? appDataPath : `${appDataPath}/`}/fonts`;

    this.fonts = await invoke<FontInfo[]>('get_fonts_from_directory', {
      dir: fontsDirectory,
    });

    await Promise.all(this.fonts.map(this.loadFont));
    this.applySelectedFont();
  }

  /**
   * Loads a font from the given path.
   * @param  {FontInfo} font - - The font information that includes the name and path of the font.
   * @returns A promise that resolves when the font is loaded or an error occurs.
   * If the font is already loaded, the promise resolves immediately.
   * If the font is invalid or cannot be loaded, it logs an error to the console.
   */
  private static async loadFont(font: FontInfo): Promise<void> {
    const isFontLoaded = Array.from(document.fonts).some(
      fontFace => fontFace.family === font.name,
    );
    if (isFontLoaded) return;

    try {
      const fontData = await readFile(font.path);
      const fontBlob = new Blob([new Uint8Array(fontData)], {
        type: 'font/ttf',
      });

      const fontUrl = URL.createObjectURL(fontBlob);

      const fontFace = new FontFace(
        font.name,
        `url(${fontUrl}) format("truetype")`,
      );

      await fontFace.load();
      document.fonts.add(fontFace);
    } catch (error) {
      console.error(
        `Error loading font "${font.name}" from ${font.path}:`,
        error,
      );
    }
  }

  /**
   * Retrieves the names of all available fonts.
   *
   * Returns an array of font names that have been loaded. These font names
   * correspond to the fonts currently available for use in the application.
   *
   * @returns An array of strings representing the names of the available fonts.
   */

  static getAvailableFonts(): string[] {
    return this.fonts.map(f => f.name);
  }

  /**
   * Applies the selected font from the game configuration to the document's root element.
   *
   * Updates the CSS variable `--game-font` to reflect the current terminal font specified
   * in the game configuration. This ensures that any elements styled with this variable
   * will use the selected font.
   */

  static applySelectedFont(): void {
    const gameConfig = gameConfigManager.getConfig();
    const root = document.documentElement;
    root.style.setProperty('--game-font', `"${gameConfig.terminal.font}"`);
  }
}
