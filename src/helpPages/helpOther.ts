import { UnBlurElement } from '../ui/other/unBlurElement';
import otherConceptsData from './otherConcepts.json';

export class HelpOther extends UnBlurElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    const templateElement = document.createElement('template');
    templateElement.innerHTML = `
      <style>
        ::selection {
          color: var(--selection-color);
          background-color: var(--selection-background);
        }

        .concepts-heading {
           margin-top: 1rem;
           width: 100%;
           background-color: var(--whiteTransparent);
           padding: 0.75rem;
           text-align: left;
           font-weight: bold;
           border-bottom: 1px solid var(--whiteTransparent);
        }

        .concepts-content {
           font: 1rem DejaVu Sans Mono, monospace;
           padding: 0.75rem;
           text-align: left;
           font-style: italic;
        }
      </style>

      <div id="concents-list">
        <!-- Buffs will be mapped here -->
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));

    super.connectedCallback();
    this.populateConcepts();
    this.unBlur();
  }

  /**
   * Populates the list of concepts in the help page.
   *
   * This function is called once, when the component is first created.
   * It reads the concepts data from the JSON file and creates a heading
   * and paragraph element for each concept, with the concept's name
   * and description. The heading and paragraph elements are then appended
   * to the list element.
   */
  private populateConcepts(): void {
    const conceptsListElement = this.shadowRoot?.querySelector(
      '#concents-list',
    ) as HTMLDivElement;

    otherConceptsData.concepts.forEach(
      (conceptObj: { concept: string; description: string }) => {
        const conceptHeading = document.createElement('div');
        conceptHeading.classList.add('concepts-heading');
        conceptHeading.textContent = conceptObj.concept;

        const conceptContent = document.createElement('p');
        conceptContent.classList.add('concepts-content');
        conceptContent.textContent = conceptObj.description;

        conceptsListElement.appendChild(conceptHeading);
        conceptsListElement.appendChild(conceptContent);
      },
    );
  }
}
