import { FadeOutElement } from '../other/fadeOutElement';
import * as storyData from '../../story/storyScreenData.json';
import { Story } from '../../types/story/story';

export class StoryScreenDisplay extends FadeOutElement {
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
          backdrop-filter: blur(35px);
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
          color: var(--white);
        }

        .story-screen-heading {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .story-text {
          font-size: 1.2rem;
          margin-bottom: 1rem;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .story-screen-footer {
          font-size: 1rem;
          margin-top: auto;
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
          <div class="story-screen-footer">Press any key to continue.</div>
        </div>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
  }

  public displayStoryCard(lvl: number): void {
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
    headingElement.innerHTML = heading;

    const paragraphContainer = document.createElement('div');

    // Iterate over the paragraph properties in the story data
    Object.keys(s).forEach(key => {
      if (key.startsWith('paragraph_')) {
        const paragraphText = s[key];
        const paragraphElement = document.createElement('p');
        paragraphElement.textContent = paragraphText;
        paragraphContainer.appendChild(paragraphElement);
      }
    });

    textElement.appendChild(paragraphContainer);
  }
}
