export class FadeInOutElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback(): void {
    const style = document.createElement('style');
    style.textContent = `
     .fade-in {
        animation: fade-in 100ms;
      }

      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
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

  /**
   * Adds the 'fade-in' class to the element, which triggers the fade in animation.
   */
  public fadeIn(): void {
    const animatedElement = this.shadowRoot?.querySelector('div');
    if (animatedElement) animatedElement.classList.add('fade-in');
  }
}
