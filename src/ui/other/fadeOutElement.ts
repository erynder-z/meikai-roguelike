export class FadeOutElement extends HTMLElement {
  constructor() {
    super();
  }

  /**
   * Adds the 'fade-out' class to the element and returns a promise that resolves
   * when the fade out animation ends.
   *
   * @returns A promise that resolves when the fade out animation ends.
   */
  public fadeOut(): Promise<void> {
    return new Promise(resolve => {
      this.classList.add('fade-out');
      this.addEventListener('animationend', () => resolve(), { once: true });
    });
  }
}
