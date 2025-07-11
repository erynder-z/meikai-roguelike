import { Buff } from '../../gameLogic/buffs/buffEnum';
import { BuffColors } from '../buffs/buffColors';
import { BuffType } from '../../types/gameLogic/buffs/buffType';
import { Equipment } from '../../gameLogic/inventory/equipment';
import { FadeOutElement } from '../other/fadeOutElement';
import { Mob } from '../../gameLogic/mobs/mob';
import { Stats } from '../../gameLogic/stats/stats';

export class StatsScreenDisplay extends FadeOutElement {
  public colorizer: BuffColors = new BuffColors();
  public stats: Stats | undefined;
  public player: Mob | undefined;
  public equipment: Equipment | undefined;

  constructor() {
    super();
  }

  connectedCallback(): void {
    const shadowRoot = this.attachShadow({ mode: 'open' });
    super.connectedCallback();
    const templateElement = document.createElement('template');
    templateElement.innerHTML = `
      <style>
        :host {
          --outer-margin: 6rem;
          --minimal-width: 33%;
          --maximal-width: 100%;
        }

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

        .stats-screen-display {
          background: var(--popupBackground);
          position: absolute;
          top: 1rem;
          left: 1rem;
          padding: 2rem;
          border-radius: 1rem;
          display: flex;
          height: calc(var(--maximal-width) - var(--outer-margin));
          width: calc(var(--minimal-width) - var(--outer-margin));
          flex-direction: column;
          color: var(--white);
          overflow-y: auto;
          overflow-x: hidden;
        }

        .stats-screen-heading {
          font-size: 1.5rem;
          text-align: center;
          margin-bottom: 2rem;
        }

        .stats {
          padding: 0 2rem;
        }

        .buffs-list-heading {
          padding-top: 0.5rem;
        }

        .buffs-list ul {
          padding: 0;
          margin: 0;
        }

        .buffs-list ul li {
          list-style-type: none;
        }

        .yellow-text {
          color: yellow;
        }

        .orange-text {
          color: orange;
        }

        .red-text {
          color: red;
        }
      </style>
      <div class="stats-screen-display">
        <div class="stats-screen-heading">
          Stats
        </div>
        <div class="stats">
          <div class="player-name">Name: ${this.player?.name}</div>
          <div class="player-hp">HP: ${this.player?.hp}</div>
          <div class="stats-list">
            <div class="armor-class">Armor class: ${this.equipment?.armorClass()}</div>
            <div class="weapon-damage">Weapon damage: ${this.equipment?.weaponDamage()}</div>
            <div class="attack-modifier">Attack modifier: ${this.stats?.damageDealModifier}</div>
            <div class="defense-modifier">Defense modifier: ${this.stats?.damageReceiveModifier}</div>
            <div class="visibility-range">Visibility: ${this.stats?.currentVisibilityRange}</div>
            <div class="hunger">Hunger: ${this.stats?.hunger}</div>
            <div class="thirst">Thirst: ${this.stats?.thirst}</div>
            <div class="mood">Mood: ${this.stats?.mood}</div>
            <div class="mob-kills">Kills: ${this.stats?.mobKillCounter}</div>
          </div>
          <div class="buffs-list-heading">Buffs:</div>
          <div class="buffs-list"></div>
        </div>
      </div>
    `;

    shadowRoot.appendChild(templateElement.content.cloneNode(true));
  }

  /**
   * Sets the current stats data.
   *
   * @param stats - The new stats data.
   */
  set currentStats(stats: Stats) {
    this.stats = stats;
  }

  /**
   * Sets the current player data.
   *
   * @param player - The new player data.
   */

  set currentPlayer(player: Mob) {
    this.player = player;
  }

  /**
   * Sets the current equipment data.
   *
   * @param equipment - The new equipment data.
   */
  set currentEquipment(equipment: Equipment) {
    this.equipment = equipment;
  }

  /**
   * Sets the player's HP text in the stats display.
   *
   * This method checks if the player HP element exists in the Shadow DOM and
   * if the player's HP and max HP are valid numbers. If valid, it sets the HP
   * text to the current HP divided by the max HP, and applies a yellow or red
   * text color if the percentage is below 50% or 25% respectively.
   */
  public displayHP(): void {
    const hpElement = this.shadowRoot?.querySelector(
      '.player-hp',
    ) as HTMLElement;
    if (!hpElement) {
      console.warn('Player HP element not found in Shadow DOM');
      return;
    }

    const hp = this.player?.hp;
    const maxhp = this.player?.maxhp;

    if (typeof hp !== 'number' || typeof maxhp !== 'number' || maxhp <= 0) {
      hpElement.innerHTML = 'HP: N/A';
      return;
    }

    const percentage = hp / maxhp;
    const hpText = `${hp} / ${maxhp}`;
    let className = '';

    if (percentage <= 0.25) {
      className = 'red-text';
    } else if (percentage <= 0.5) {
      className = 'yellow-text';
    }

    if (className) {
      hpElement.innerHTML = `HP: <span class="${className}">${hpText}</span>`;
    } else {
      hpElement.innerHTML = `HP: ${hpText}`;
    }
  }
  /**
   * Updates the display of active buffs by populating the "buffs-list" element
   * with a list of buffs. Each buff is displayed as a colored span, based on the
   * buff's type. Buffs are separated by commas.
   *
   * @param buffMap - A map containing the buffs and their corresponding types that should be displayed in the buffs list.
   */

  public setBuffs(buffMap: Map<Buff, BuffType>): void {
    const buffsList = this.shadowRoot?.querySelector(
      '.buffs-list',
    ) as HTMLElement;
    if (buffsList) {
      buffsList.innerHTML = '';

      const buffText = document.createElement('span');
      buffsList.appendChild(buffText);

      let first = true;

      buffMap.forEach((buff, key) => {
        if (!first) {
          buffsList.appendChild(document.createTextNode(', '));
        }
        first = false;

        const buffSpan = document.createElement('span');
        buffSpan.textContent = `${Buff[key]}`;

        this.colorizer.colorBuffs(buffSpan);
        buffsList.appendChild(buffSpan);
      });
    }
  }
  /**
   * Returns the label and class name corresponding to the given value in the
   * given list of levels. If the given value does not match any of the levels,
   * the method returns the default label and class name.
   *
   * @param value - The value to match against the levels.
   * @param levels - The list of levels to check against.
   * @return The label and class name corresponding to the given value.
   */
  private getLevelLabel(
    value: number,
    levels: { threshold: number; label: string; className?: string }[],
  ): { label: string; className?: string } {
    const level = levels.find(({ threshold }) => value < threshold);
    return level ?? { label: 'Unknown' };
  }

  /**
   * Updates the text content of the element selected by the given selector.
   * The element should contain a single child text node and a single child span element.
   * The text content of the span element is set to the given label with the given class name.
   * The text content of the text node is set to the given prefix.
   *
   * @param selector - The CSS selector for the element to update.
   * @param value - The value to determine the label and class name for.
   * @param levels - The list of levels to check against.
   * @param prefix - The prefix to display before the label.
   */
  private updateStatDisplay(
    selector: string,
    value: number,
    levels: { threshold: number; label: string; className?: string }[],
    prefix: string,
  ): void {
    const displayEl = this.shadowRoot?.querySelector(selector) as HTMLElement;
    if (!displayEl) return;

    const { label, className } = this.getLevelLabel(value, levels);

    displayEl.innerHTML = `${prefix}: <span class="${className}"> ${label} </span>`;
  }

  /**
   * Displays the player's hunger level in the stats screen display.
   * The hunger level is represented as a label with a class name corresponding
   * to the level of hunger (e.g. 'Satiated', 'Peckish', 'Hungry', 'Famished', 'Ravenous').
   * The method first checks if the player's hunger level is a number and
   * returns early if it is not. Otherwise, it updates the text content of the
   * element with the selector '.hunger' using the getLevelLabel method and the
   * given list of hunger levels.
   */
  public displayHunger(): void {
    if (typeof this.stats?.hunger !== 'number') return;

    const hungerLevels = [
      { threshold: 2, label: 'Satiated' },
      { threshold: 4, label: 'Peckish' },
      { threshold: 6, label: 'Hungry', className: 'yellow-text' },
      { threshold: 8, label: 'Famished', className: 'orange-text' },
      { threshold: Infinity, label: 'Ravenous', className: 'red-text' },
    ];

    this.updateStatDisplay(
      '.hunger',
      this.stats.hunger,
      hungerLevels,
      'Hunger',
    );
  }

  /**
   * Displays the player's thirst level in the stats screen display.
   * The thirst level is represented as a label with a class name corresponding
   * to the level of thirst (e.g. 'Hydrated', 'Dry-mouthed', 'Thirsty', 'Parched', 'Dehydrated').
   * The method first checks if the player's thirst level is a number and
   * returns early if it is not. Otherwise, it updates the text content of the
   * element with the selector '.thirst' using the getLevelLabel method and the
   * given list of thirst levels.
   */
  public displayThirst(): void {
    if (typeof this.stats?.thirst !== 'number') return;

    const thirstLevels = [
      { threshold: 2, label: 'Hydrated' },
      { threshold: 4, label: 'Dry-mouthed' },
      { threshold: 6, label: 'Thirsty', className: 'yellow-text' },
      { threshold: 8, label: 'Parched', className: 'orange-text' },
      { threshold: Infinity, label: 'Dehydrated', className: 'red-text' },
    ];

    this.updateStatDisplay(
      '.thirst',
      this.stats.thirst,
      thirstLevels,
      'Thirst',
    );
  }
}
