export class KeypressScrollHandler {
  private container: HTMLElement;
  private scrollAmount: number;

  constructor(container: HTMLElement, scrollAmount: number = 50) {
    this.container = container;
    this.scrollAmount = scrollAmount;
  }

  /**
   * Handles key press events for virtual scrolling.
   *
   * Listens for the ArrowUp and ArrowDown keys, and when either is pressed, scrolls the container by the given scroll amount.
   * @param event - The keyboard event.
   */
  public handleVirtualScroll(event: KeyboardEvent): void {
    event.preventDefault();

    if (event.key === 'ArrowDown') {
      this.container.scrollTop += this.scrollAmount;
    } else if (event.key === 'ArrowUp') {
      this.container.scrollTop -= this.scrollAmount;
    }
  }
}
