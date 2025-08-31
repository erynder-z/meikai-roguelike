import { Builder } from '../../gameBuilder/builder';
import { BaseDirectory, readFile } from '@tauri-apps/plugin-fs';
import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { DynamicScreenMaker } from '../../gameLogic/screens/dynamicScreenMaker';
import { GlyphLoader } from '../../loaders/glyphLoader';
import { SerializedGameState } from '../../shared-types/utilities/saveStateHandler';
import { PopupHandler } from '../popup/popupHandler';

export class GenerateTitleScreen {
  /**
   * Generates a title screen and inserts it at the start of the document.
   * The title screen will be passed the given seed.
   * The title screen will dispatch a 'start-new-game' event when the user chooses to start the game.
   * The title screen will dispatch a 'load-game' event when the user chooses to load a saved game.
   * The title screen will dispatch a 'change-seed' event when the user chooses to change the seed.
   */
  public static async generate() {
    const body = document.getElementById('body-main');
    if (!body) {
      console.error('Body element not found');
      return;
    }

    const titleScreen = document.createElement('title-screen');
    const titleContainer = document.createElement('div');
    titleContainer.id = 'title-container';
    titleContainer.appendChild(titleScreen);

    // Ensure the titleContainer is the first child of the body
    if (body.firstChild) {
      body.insertBefore(titleContainer, body.firstChild);
    } else {
      body.appendChild(titleContainer);
    }

    // Add event listeners to start a new game
    titleScreen.addEventListener('start-new-game', async () => {
      const gameConfig = gameConfigManager.getConfig();
      try {
        titleContainer.remove();
        await GlyphLoader.initializeGlyphs();
        DynamicScreenMaker.runBuilt_InitialGameSetup(
          new Builder(gameConfig.seed, gameConfig.player),
          gameConfig.seed,
        );
      } catch (error) {
        console.error('Error starting new game:', error);
      }
    });

    // Add event listeners to load a saved game
    titleScreen.addEventListener('load-game', async () => {
      try {
        const binaryData = await readFile('savestate.bin', {
          baseDir: BaseDirectory.AppData,
        });
        const jsonString = new TextDecoder().decode(binaryData);
        const saveState: SerializedGameState = JSON.parse(jsonString);
        const loadedSeed = saveState.serializedBuild.data.seed;
        const loadedPlayer = saveState.playerConfig;
        try {
          titleContainer.remove();
          await GlyphLoader.initializeGlyphs();
          DynamicScreenMaker.runBuilt_RestoreGameSetup(
            new Builder(loadedSeed, loadedPlayer),
            loadedSeed,
            saveState,
          );
          PopupHandler.showGoodPopup('Game restored!');
        } catch (error) {
          console.error('Error restoring game:', error);
          PopupHandler.showBadPopup('Error restoring game!');
        }
      } catch (error) {
        console.error('Error opening file:', error);
        PopupHandler.showBadPopup('Error opening file!');
      }
    });
  }
}
