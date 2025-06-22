import { Equipment } from '../../gameLogic/inventory/equipment';
import { Slot } from '../../gameLogic/itemObjects/slot';

export class EquipmentDisplay extends HTMLElement {
  constructor() {
    super();
  }

  /**
   * Sets up the element's shadow root and styles it with a template.
   * This method is called when the element is inserted into the DOM.
   * It is called after the element is created and before the element is connected
   * to the DOM.
   *
   */
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

        ::selection {
          color: var(--selection-color);
          background-color: var(--selection-background);
        }

        .equipment-display {
          display: flex;
          gap: 5rem;
          height:100%; 
        }

        .hands,
        .body {
          display: flex;
          flex-direction: column;

        }

        .equipment-slot {
          display: flex;
        }

        .equipment-slot > div:first-child {
          width: 100px;
          font-weight: bold;
        }
      </style>

      <div class="equipment-display">
        <div class="hands">
          <div class="equipment-slot">
            <div>Main hand:&nbsp;</div>
            <div id="MainHand">empty</div>
          </div>
          <div class="equipment-slot">
            <div>Off hand:&nbsp;</div>
            <div id="OffHand">empty</div>
          </div>
        </div>
        <div class="body">
          <div class="equipment-slot">
            <div>Head:&nbsp;</div>
            <div id="Head">empty</div>
          </div>
          <div class="equipment-slot">
            <div>Hands:&nbsp;</div>
            <div id="Hands">empty</div>
          </div>
          <div class="equipment-slot">
            <div>Back:&nbsp;</div>
            <div id="Back">empty</div>
          </div>
          <div class="equipment-slot">
            <div>Legs:&nbsp;</div>
            <div id="Legs">empty</div>
          </div>
          <div class="equipment-slot">
            <div>Feet:&nbsp;</div>
            <div id="Feet">empty</div>
          </div>
        </div>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
  }

  /**
   * Sets the text content of the elements in the shadow DOM to the descriptions of the items in the given equipment.
   *
   * @param equipment - The equipment to display. If undefined, the elements will be set to 'empty'.
   */
  public setEquipment(equipment: Equipment | undefined): void {
    const slots = [
      Slot.MainHand,
      Slot.OffHand,
      Slot.Head,
      Slot.Hands,
      Slot.Back,
      Slot.Legs,
      Slot.Feet,
    ];

    slots.forEach(slot => {
      const slotElement = this.shadowRoot?.getElementById(Slot[slot]);
      const itemDescription =
        equipment?.getItemInSlot(slot)?.description() ?? 'empty';

      if (slotElement) {
        slotElement.textContent = itemDescription;
      }
    });
  }
}
