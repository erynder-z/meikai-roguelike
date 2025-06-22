import colors from '../colors/colors.json';

export class ColorLoader {
  /**
   * Initializes the colors used in the game by setting them as CSS root variables.
   *
   * @return A promise that resolves when the colors have been set.
   */
  public static initializeColors(): Promise<void> {
    return new Promise(resolve => {
      const root = document.documentElement;

      root.style.setProperty(
        '--backgroundDefault',
        colors.root['--backgroundDefault'],
      );
      root.style.setProperty(
        '--backgroundDefaultTransparent',
        colors.root['--backgroundDefaultTransparent'],
      );
      root.style.setProperty('--accent', colors.root['--accent']);
      root.style.setProperty('--white', colors.root['--white']);
      root.style.setProperty(
        '--whiteTransparent',
        colors.root['--whiteTransparent'],
      );
      root.style.setProperty('--yellow', colors.root['--yellow']);
      root.style.setProperty(
        '--postMortemAccent',
        colors.root['--postMortemAccent'],
      );
      root.style.setProperty(
        '--scrollbar-foreground',
        colors.root['--scrollbar-foreground'],
      );
      root.style.setProperty(
        '--scrollbar-background',
        colors.root['--scrollbar-background'],
      );
      root.style.setProperty(
        '--selection-color',
        colors.root['--selection-color'],
      );
      root.style.setProperty(
        '--selection-background',
        colors.root['--selection-background'],
      );
      root.style.setProperty('--grayedOut', colors.root['--grayedOut']);
      root.style.setProperty(
        '--popupBackground',
        colors.root['--popupBackground'],
      );
      root.style.setProperty(
        '--popupBackgroundGood',
        colors.root['--popupBackgroundGood'],
      );
      root.style.setProperty(
        '--popupBackgroundBad',
        colors.root['--popupBackgroundBad'],
      );

      resolve();
    });
  }
}
