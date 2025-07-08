import { FadeOutElement } from '../other/fadeOutElement';
import * as storyData from '../../story/storyScreenData.json';
import { Story } from '../../types/story/story';

export class StoryScreenDisplay extends FadeOutElement {
  private isAnimating = false;
  private animationFrameId: number | null = null;
  private currentLevel = 0;

  constructor() {
    super();
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    const templateElement = document.createElement('template');
    templateElement.innerHTML = `
      <style>
        ::-webkit-scrollbar {
          width: 0.25rem;
        }

        ::-webkit-scrollbar-thumb {
          background-color: var(--scrollbar-foreground);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-track {
          background-color: var(--scrollbar-background);
        }

        .story-screen-display {
          background: black;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          height: 100%;
          width: 100%;
        }

        .story-card {
          background: var(--storyScreenBackground);
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          padding: 2rem;
          border-radius: 1rem;
          display: flex;
          height: 66%;
          width: 50%;
          flex-direction: column;
          font-family: 'UA Squared', monospace;
          color: var(--white);
        }

        .story-screen-heading {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .story-text {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .story-text p {
          margin-bottom: 1rem;
        }

        .story-screen-footer {
          font-size: 1rem;
          margin-top: auto;
        }

        .hidden {
          display: none;
        }

        .fade-out {
          animation: fade-out 100ms;
        }

        @keyframes fade-out {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }

      </style>

      <div class="story-screen-display">
        <div class="story-card">
          <div class="story-screen-heading"></div>
          <div class="story-text"></div>
          <div class="story-screen-footer hidden">Press any key to continue.</div>
        </div>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
  }

  /**
   * Populates the story screen display with the story content for the given level.
   * @param lvl - The level of the story content to display.
   */
  public displayStoryCard(lvl: number): void {
    this.currentLevel = lvl;
    const headingElement = this.shadowRoot?.querySelector(
      '.story-screen-heading',
    ) as HTMLElement;
    const textElement = this.shadowRoot?.querySelector(
      '.story-text',
    ) as HTMLElement;
    if (!textElement || !headingElement) {
      console.warn('Element not found in Shadow DOM');
      return;
    }

    const s: Story = storyData.story[lvl];
    const heading = s.heading;

    const paragraphs: string[] = [];
    Object.keys(s).forEach(key => {
      if (key.startsWith('paragraph_')) {
        paragraphs.push(s[key]);
      }
    });

    this.typewriterAnimation(headingElement, textElement, heading, paragraphs);
  }

  /**
   * Types out the story text, one character at a time, on the provided elements.
   * @param headingElement - The element to display the heading text.
   * @param textElement - The element to display the paragraph text.
   * @param heading - The heading text.
   * @param paragraphs - The paragraph text.
   */
  private typewriterAnimation(
    headingElement: HTMLElement,
    textElement: HTMLElement,
    heading: string,
    paragraphs: string[],
  ): void {
    this.isAnimating = true;
    headingElement.innerHTML = '';
    textElement.innerHTML = '';
    let partIndex = 0; // 0 for heading, 1+ for paragraphs
    let charIndex = 0;

    const parts = [heading, ...paragraphs];

    /**
     * Recursively called function to type out the story text, one character at a time.
     * When all parts have been typed out, it shows the footer and ends the animation.
     * It also pauses between parts.
     */
    const type = () => {
      if (partIndex >= parts.length) {
        this.showFooter();
        this.isAnimating = false;
        return;
      }

      const minDelay = 5;
      const maxDelay = 75;

      const delay =
        Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

      const currentPart = parts[partIndex];
      if (charIndex < currentPart.length) {
        if (partIndex === 0) {
          headingElement.textContent += currentPart.charAt(charIndex);
        } else {
          if (charIndex === 0) {
            textElement.innerHTML += '<p></p>';
          }
          textElement.lastChild!.textContent += currentPart.charAt(charIndex);
        }
        charIndex++;
        this.animationFrameId = setTimeout(type, delay) as unknown as number;
      } else {
        partIndex++;
        charIndex = 0;
        this.animationFrameId = setTimeout(type, delay) as unknown as number; // Pause between parts
      }
    };

    type();
  }

  /**
   * Immediately stops the ongoing typewriter animation and displays the full story text.
   * Clears the animation timeout and sets the animation state to not running.
   * Updates the heading and text elements with the complete story content for the current level.
   * Finally, it shows the footer indicating that the animation has ended.
   */

  public skipAnimation(): void {
    if (this.animationFrameId) {
      clearTimeout(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.isAnimating = false;

    const textElement = this.shadowRoot?.querySelector(
      '.story-text',
    ) as HTMLElement;
    const headingElement = this.shadowRoot?.querySelector(
      '.story-screen-heading',
    ) as HTMLElement;

    if (textElement && headingElement) {
      const s: Story = storyData.story[this.currentLevel];
      headingElement.textContent = s.heading;
      textElement.innerHTML = '';
      Object.keys(s).forEach(key => {
        if (key.startsWith('paragraph_')) {
          const p = document.createElement('p');
          p.textContent = s[key];
          textElement.appendChild(p);
        }
      });
    }

    this.showFooter();
  }

  /**
   * Indicates whether the typewriter animation is currently running.
   * @return true if the animation is running, false otherwise.
   */
  public isAnimationRunning(): boolean {
    return this.isAnimating;
  }

  /**
   * Reveals the footer element on the story screen display.
   *
   * This method selects the footer element from the shadow DOM
   * and removes the 'hidden' class to make it visible.
   */

  private showFooter(): void {
    const footer = this.shadowRoot?.querySelector(
      '.story-screen-footer',
    ) as HTMLElement;

    if (footer) footer.classList.remove('hidden');
  }
}
