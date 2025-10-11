import { AutoHeal } from '../gameLogic/commands/autoHeal';
import { Equipment } from '../gameLogic/inventory/equipment';
import { Inventory } from '../gameLogic/inventory/inventory';
import { EventCategory, LogMessage } from '../gameLogic/messages/logMessage';
import { MessageLog } from '../gameLogic/messages/messageLog';
import { Mob } from '../gameLogic/mobs/mob';
import { NeedsHandler } from '../gameLogic/needs/needsHandler';
import { Stats } from '../gameLogic/stats/stats';
import { RandomGenerator } from '../randomGenerator/randomGenerator';
import { GameState } from '../shared-types/gameBuilder/gameState';
import { GameMapType } from '../shared-types/gameLogic/maps/mapModel/gameMapType';
import { MobAI } from '../shared-types/gameLogic/mobs/mobAI';
import { Builder } from './builder';
import { MapHandler } from './mapHandler';

/**
 * The game instance that holds the game state.
 */
export class Game implements GameState {
  public ai: MobAI | null = null;
  public log: MessageLog = new MessageLog();
  public dungeon: MapHandler = new MapHandler();
  public autoHeal: AutoHeal | undefined = new AutoHeal();
  public inventory = new Inventory();
  public equipment = new Equipment();
  public needs = new NeedsHandler();
  public stats = new Stats();
  public surfaceTemp = 15;
  public shouldShowStoryScreen = false;
  public shownStoryLevels: number[] = [];
  constructor(
    public rand: RandomGenerator,
    public player: Mob,
    public build: Builder,
  ) {}

  /**
   * Retrieve the current map.
   *
   * @return The current map, or null if not available.
   */
  public currentMap(): GameMapType | null {
    return this.dungeon.currentMap(this);
  }

  /**
   * Adds a message to the message log.
   *
   * @param msg - The message to add.
   */
  public message(msg: LogMessage): void {
    const isFlashMsg = false;
    this.log.message(msg, isFlashMsg);
  }

  /**
   * Displays a flash message.
   *
   * @param msg - The message to add.
   */
  public flash(msg: LogMessage): void {
    const isFlashMsg = true;
    this.log.message(msg, isFlashMsg);
  }

  /**
   * Adds the given event category to the current event in the message log.
   *
   * @param evt - The event category to add.
   */
  public addCurrentEvent(evt: EventCategory): void {
    this.log.addCurrentEvent(evt);
  }
}
