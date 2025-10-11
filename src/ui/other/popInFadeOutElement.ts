export class PopInFadeOutElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback(): void {
    const style = document.createElement('style');
    style.textContent = `
     .pop-in {
        animation: pop-in 150ms forwards ease-out;
      }

      @keyframes pop-in {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
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
   * @param removeAfter - Whether to remove the element from the DOM after fading out.
   * @returns A promise that resolves when the fade out animation ends.
   */
  public fadeOut(removeAfter = true): Promise<void> {
    return new Promise(resolve => {
      const animatedElement = this.shadowRoot?.querySelector('div');
      if (animatedElement) {
        animatedElement.classList.remove('pop-in');
        animatedElement.classList.add('fade-out');
        animatedElement.addEventListener(
          'animationend',
          () => {
            if (removeAfter) {
              this.remove();
            }
            resolve();
          },
          {
            once: true,
          },
        );
      } else {
        if (removeAfter) {
          this.remove();
        }
        resolve();
      }
    });
  }

  /**
   * Adds the 'pop-in' class to the element, which triggers the pop-in animation.
   */
  public popIn(): void {
    const animatedElement = this.shadowRoot?.querySelector('div');
    if (animatedElement) {
      animatedElement.classList.remove('fade-out');
      animatedElement.classList.add('pop-in');
    }
  }
}
