import { MessageLog } from '../../gameLogic/messages/messageLog';

type FlashDecoratorDataEntry = {
  id: string;
  name: string;
  fgCol: string;
  bgCol?: string;
  char: string;
  hasSolidBg: boolean;
  description: string;
  help?: {
    show: boolean;
    about: string;
  };
  isOpaque?: boolean;
  isBlockingMovement?: boolean;
  isBlockingProjectiles?: boolean;
  isDiggable?: boolean;
  isCausingSlow?: boolean;
  isCausingBurn?: boolean;
  isMagnetic?: boolean;
  isCausingBleed?: boolean;
  isGlowing?: boolean;
  isCausingPoison?: boolean;
  isCausingConfusion?: boolean;
};

/**
 * Utility class to add styling to flash messages.
 */
export class FlashDecorator {
  private styleElement: HTMLStyleElement;

  constructor(shadowRoot: ShadowRoot) {
    // Create and append the style element only once in the constructor.
    this.styleElement = document.createElement('style');
    shadowRoot.appendChild(this.styleElement);
  }
  /**
   * Adds a span element to the given fragment with a message indicating
   * how many messages are in the message log's queue.
   *
   * @param fragment - The fragment to add the span to.
   * @param log - The message log to check for queued messages.
   */
  public addMoreSpanToFragment(
    fragment: DocumentFragment,
    log: MessageLog,
  ): void {
    const numberOfQueueMessages: number = log.len() - 1;
    const s =
      numberOfQueueMessages >= 2
        ? `(+${numberOfQueueMessages} more messages)`
        : `(+${numberOfQueueMessages} more message)`;
    const moreSpan = document.createElement('span');
    moreSpan.textContent = s;
    moreSpan.classList.add('more-span');
    fragment.appendChild(moreSpan);
  }

  /**
   * Replaces occurrences of names (or a single name) in the given fragment with colored spans.
   * The spans are given a class name based on the type of name and the name itself.
   *
   * @param fragment - The fragment to modify.
   * @param namesOrName - The array of objects containing the names to replace or a single player name.
   * @param type - The type of name (e.g. 'mob', 'item', 'env'). Ignored if a single player name is passed.
   */
  public colorize(
    fragment: DocumentFragment,
    namesOrName: FlashDecoratorDataEntry[] | string,
    type?: 'mob' | 'corpse' | 'item' | 'env',
  ): void {
    let regex: RegExp;
    let createClassName: (name: string) => string;

    if (typeof namesOrName === 'string') {
      // If it's a single name
      regex = new RegExp(`\\b(${namesOrName})\\b`, 'i');
      createClassName = () => `player-span`;
    } else {
      // If it's an array of entries (FlashDecoratorDataEntry generated from JSON)
      const names = namesOrName.map(entry => entry.name);
      regex = new RegExp(`\\b(${names.join('|')})\\b`, 'i');
      createClassName = name => `${this.sanitizeClassName(name)}-${type}-span`;
    }

    // Iterate over all the child nodes of the given fragment.
    fragment.childNodes.forEach(child => {
      if (child instanceof Text) {
        const text = child.textContent;
        const frag = document.createDocumentFragment();
        let lastIndex = 0;
        let found = false;

        text?.replace(regex, (match, name, index) => {
          if (found) return match;
          frag.appendChild(
            document.createTextNode(text.slice(lastIndex, index)),
          );

          // Create span element with dynamic class
          const span = document.createElement('span');
          span.textContent = match;
          span.classList.add(createClassName(name));
          frag.appendChild(span);

          found = true;
          lastIndex = index + match.length;
          return match;
        });

        // Add remaining text after the last match.
        if (text?.slice(lastIndex)) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex)));
        }

        fragment.replaceChild(frag, child);
      }
    });
  }

  /**
   * Creates styles for the given data or color.
   *
   * If dataOrColor is a string, it is treated as a single player style.
   * A style rule is created for a span element with a class name of 'player-span'
   * and the color and font weight properties are set to the given dataOrColor.
   *
   * If dataOrColor is an array of FlashDecoratorDataEntry objects, it is treated as a general style.
   * For each entry, a style rule is created for a span element with a class name of
   * `${this.sanitizeClassName(entry.name)}-${type}-span` and the color and font weight properties are set
   * to the entry's fgCol property.
   *
   * @param dataOrColor - The data or color to create styles for.
   * @param type - The optional type of style. Ignored if dataOrColor is a string.
   */
  public createStyles(
    dataOrColor: FlashDecoratorDataEntry[] | string,
    type?: string,
  ): void {
    if (typeof dataOrColor === 'string') {
      // Player style
      const className = `player-span`;
      const cssRule = `.${className} { color: ${dataOrColor}; font-weight: bold; }`;
      this.appendStyleRule(cssRule);
    } else {
      // General style for multiple entries
      dataOrColor.forEach(entry => {
        const className = `${this.sanitizeClassName(entry.name)}-${type}-span`;
        const cssRule = `.${className} { color: ${entry.fgCol}; font-weight: bold; }`;
        this.appendStyleRule(cssRule);
      });
    }
  }

  /**
   * Appends a CSS rule to the existing style element.
   *
   * @param rule - The CSS rule to append.
   */
  private appendStyleRule(rule: string): void {
    if (this.styleElement.sheet) {
      this.styleElement.sheet.insertRule(
        rule,
        this.styleElement.sheet.cssRules.length,
      );
    }
  }

  /**
   * Sanitizes a string for use as a class name.
   * - Converts to lower case
   * - Replaces one or more spaces with a single underscore
   * - Replaces any non-alphanumeric characters with an underscore
   *
   * @param name - The string to sanitize.
   * @return The sanitized string.
   */
  private sanitizeClassName = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9-]/g, '_');
  };
}
