import controls from './control_schemes.json';
import { ControlSchemeName } from '../types/controls/controlSchemeType';

/**
 * Provides the current control scheme to be used in the game. Available control schemes are defined in the `control_schemes.json` file.
 */
export class ControlSchemeManager {
  private activeScheme: Record<string, string[]>;

  constructor(currentSchemeName: ControlSchemeName = 'default') {
    if (!(currentSchemeName in controls)) {
      throw new Error(`Control scheme "${currentSchemeName}" not found.`);
    }

    this.activeScheme = controls[currentSchemeName];
  }

  /**
   * Gets the current active control scheme.
   *
   * @return The active control scheme.
   */
  public getActiveScheme(): Record<string, string[]> {
    return this.activeScheme;
  }

  /**
   * Takes a KeyboardEvent and extracts the associated key code.
   *
   * @param event - the keyboard event to extract the key code from.
   * @return the extracted key code.
   */
  public keyPressToCode(event: KeyboardEvent): string {
    let keyCode: string = event.key;
    switch (event.code) {
      case 'Numpad1':
      case 'Numpad2':
      case 'Numpad3':
      case 'Numpad4':
      case 'Numpad5':
      case 'Numpad6':
      case 'Numpad7':
      case 'Numpad8':
      case 'Numpad9':
      case 'Escape':
      case 'Home':
        keyCode = event.code;
        break;
    }
    return keyCode;
  }
}
