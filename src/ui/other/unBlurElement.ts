export class UnBlurElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback(): void {
    const style = document.createElement('style');
    style.textContent = `
     .un-blur {
        animation: unBlur 250ms;
      }

     @keyframes unBlur {
          from {
            filter: blur(35px);
          }
          to {
            filter: blur(0px);
          }
        }
    `;
    this.shadowRoot?.appendChild(style);
  }

  /**
   * Animates the element out of a blurred state by adding the `un-blur` class
   * to the first `div` element in the shadow root.
   */
  public unBlur(): void {
    const animatedElement = this.shadowRoot?.querySelector('div');
    if (animatedElement) animatedElement.classList.add('un-blur');
  }
}
