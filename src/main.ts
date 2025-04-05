import './styles/cssReset.css';
import './styles/style-main.css';
import './styles/scanlines.css';
import { Builder } from './gameBuilder/builder';
import { gameConfigManager } from './gameConfigManager/gameConfigManager';
import { ColorLoader } from './loaders/colorLoader';
import { DynamicScreenMaker } from './gameLogic/screens/dynamicScreenMaker';
import { GenerateMainUI } from './ui/uiGenerators/generateMainUI';
import { GenerateTitleScreen } from './ui/uiGenerators/generateTitleScreen';
import { GlyphLoader } from './loaders/glyphLoader';
import { handleGlobalKeydown } from './utilities/handleGlobalKeyDown';
import { invoke } from '@tauri-apps/api/core';
import { LayoutManager } from './ui/layoutManager/layoutManager';

const initializeGame = async () => {
  try {
    await gameConfigManager.initialize();

    const gameConfig = gameConfigManager.getConfig();

    const { SHOW_MENU, seed, player } = gameConfig;

    // Parallel Initialization of Colors and Glyphs
    await Promise.all([
      ColorLoader.initializeColors(),
      GlyphLoader.initializeGlyphs(),
    ]);

    // Conditional UI Generation Based on SHOW_MENU
    if (SHOW_MENU) {
      await GenerateTitleScreen.generate();
    } else {
      const titleContainer = document.getElementById('title-container');
      if (titleContainer) titleContainer.remove();
      await DynamicScreenMaker.runBuilt_InitialGameSetup(
        new Builder(seed, player),
        seed,
      );
    }

    // Generate Main UI
    await GenerateMainUI.generate();
  } catch (error) {
    console.error('Error initializing game:', error);
  }
};

// Apply layout adjustments based on gameConfig
const adjustLayout = async () => {
  const gameConfig = gameConfigManager.getConfig();
  const layoutManager = new LayoutManager();
  layoutManager.setMessageDisplayLayout(gameConfig.message_display);
  layoutManager.setImageDisplayLayout(gameConfig.image_display);
};

// DOMContentLoaded Event Listener
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initializeGame();
    await adjustLayout();
    invoke('show_main_window');
  } catch (error) {
    console.error('Failed to initialize the game:', error);
  }
  // Capture global keydown event, in order to prevent default behavior of a key, if needed.
  document.addEventListener('keydown', handleGlobalKeydown);
});
