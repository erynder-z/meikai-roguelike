import { PopupBoxBad } from './popupBoxBad';
import { PopupBoxGood } from './popupBoxGood';

/**
 * Handles showing informational popups to the user.
 */
export class PopupHandler {
  /**
   * Displays a popup box with a green background color and the given message.
   * The popup will be automatically closed after a few seconds.
   *
   * @param msg - The message to be displayed in the popup.
   */
  public static showGoodPopup(msg: string): void {
    const body = document.getElementById('body-main');
    if (!body) {
      console.error('Body element not found');
      return;
    }

    const popup = document.createElement('popup-box-good') as PopupBoxGood;

    body.appendChild(popup);
    popup.showMessage(msg);
  }

  /**
   * Displays a popup box with a red background color and the given message.
   * The popup will be automatically closed after a few seconds.
   *
   * @param msg - The message to be displayed in the popup.
   */
  public static showBadPopup(msg: string): void {
    const body = document.getElementById('body-main');
    if (!body) {
      console.error('Body element not found');
      return;
    }

    const popup = document.createElement('popup-box-bad') as PopupBoxBad;

    body.appendChild(popup);
    popup.showMessage(msg);
  }
}
