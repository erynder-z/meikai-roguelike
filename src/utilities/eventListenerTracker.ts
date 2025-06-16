type ListenerEntry = {
  target: EventTarget;
  type: string;
  listener: EventListenerOrEventListenerObject;
  options?: boolean | AddEventListenerOptions;
};

/**
 * Tracks manually added event listeners and allows for easy removal.
 */
export class EventListenerTracker {
  private listeners: ListenerEntry[] = [];

  /**
   * Adds an event listener to the specified target and tracks it.
   *
   * @param {EventTarget} target - The target to which the event listener should be added.
   * @param {string} type - The type of event to listen for.
   * @param {EventListenerOrEventListenerObject} listener - The event listener function or object.
   * @param {boolean | AddEventListenerOptions} [options] - Optional object specifying characteristics about the event listener.
   */

  add(
    target: EventTarget,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    target.addEventListener(type, listener, options);
    this.listeners.push({ target, type, listener, options });
  }

  /**
   * Adds an event listener to the specified element, by id, within the provided root and tracks it.
   *
   * @param {Document | ShadowRoot | null} root - The root element to search for the element with the specified id.
   * @param {string} id - The id of the element to which the event listener should be added.
   * @param {string} type - The type of event to listen for.
   * @param {EventListenerOrEventListenerObject} listener - The event listener function or object.
   * @param {boolean | AddEventListenerOptions} [options] - Optional object specifying characteristics about the event listener.
   */
  addById(
    root: Document | ShadowRoot | null,
    id: string,
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    const el = root?.getElementById(id);
    if (el) {
      this.add(el, type, listener, options);
    } else {
      console.warn(`Element with id "${id}" not found in provided root.`);
    }
  }

  /**
   * Removes all tracked event listeners.
   *
   * Iterates over the stored event listeners and removes each one from its
   * respective target. After all event listeners have been removed, the internal
   * list of listeners is cleared.
   */

  removeAll(): void {
    for (const { target, type, listener, options } of this.listeners) {
      target.removeEventListener(type, listener, options);
    }
    this.listeners = [];
  }
}
