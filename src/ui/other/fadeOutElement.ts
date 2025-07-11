export class FadeOutElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback(): void {
    const style = document.createElement('style');
    style.textContent = `
      .fade-out {
        animation: fade-out 100ms forwards;
      }

      @keyframes fade-out {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
    `;
    this.shadowRoot?.appendChild(style);
  }

  /**
   * Adds the 'fade-out' class to the element and returns a promise that resolves
   * when the fade out animation ends.
   *
   * @returns A promise that resolves when the fade out animation ends.
   */
  public fadeOut(): Promise<void> {
    return new Promise(resolve => {
      const animatedElement = this.shadowRoot?.querySelector('div');
      if (animatedElement) {
        animatedElement.classList.add('fade-out');
        animatedElement.addEventListener(
          'animationend',
          () => {
            this.remove();
            resolve();
          },
          {
            once: true,
          },
        );
      } else {
        this.remove();
        resolve();
      }
    });
  }
}
