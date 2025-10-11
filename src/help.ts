import './styles/cssReset.css';
import './styles/style-help.css';
import { invoke } from '@tauri-apps/api/core';
import { gameConfigManager } from './gameConfigManager/gameConfigManager';
import { ColorLoader } from './loaders/colorLoader';
import { GenerateHelpUI } from './ui/uiGenerators/generateHelpUI';
import { handleGlobalKeydown } from './utilities/handleGlobalKeyDown';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await gameConfigManager.initialize();

    // Parallel Initialization of Colors and UI
    await Promise.all([
      ColorLoader.initializeColors(),
      GenerateHelpUI.generate(),
    ]);

    // Unhide the help window that is hidden on initialization for a better user experience
    invoke('show_hidden_help_window');
  } catch (error) {
    console.error('Error initializing help:', error);
  }

  document.addEventListener('keydown', handleGlobalKeydown);
});
