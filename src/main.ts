import './styles/cssReset.css';
import './styles/style-main.css';
import { Builder } from './components/Builder/Builder';
import { ColorLoader } from './components/Colors/ColorLoader';
import { DynamicScreenMaker } from './components/Screens/DynamicScreenMaker';
import { GenerateTitleScreen } from './components/Utilities/GenerateTitleScreen';
import { initParams } from './initParams/InitParams';
import { invoke } from '@tauri-apps/api/tauri';

const initializeGame = async () => {
  const { SHOW_MENU, seed, player } = initParams;

  await ColorLoader.initializeColors();

  if (SHOW_MENU) {
    GenerateTitleScreen.generate();
  } else {
    const titleContainer = document.getElementById('title-container');
    if (titleContainer) titleContainer.remove();

    DynamicScreenMaker.runBuilt_InitialGameSetup(
      new Builder(seed, player),
      seed,
    );
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  await initializeGame();
  await invoke('close_splashscreen');
});
