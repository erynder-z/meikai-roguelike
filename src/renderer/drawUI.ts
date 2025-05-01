import { BuffsDisplay } from '../ui/buffs/buffsDisplay';
import { DrawableTerminal } from '../types/terminal/drawableTerminal';
import { EnvironmentChecker } from '../gameLogic/environment/environmentChecker';
import { EquipmentDisplay } from '../ui/equipment/equipmentDisplay';
import { EventCategory, LogMessage } from '../gameLogic/messages/logMessage';
import { FlashDisplay } from '../ui/flashDisplay/flashDisplay';
import { gameConfigManager } from '../gameConfigManager/gameConfigManager';
import { GameMapType } from '../types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../types/gameBuilder/gameState';
import { Glyph } from '../gameLogic/glyphs/glyph';
import { GlyphInfo } from '../gameLogic/glyphs/glyphInfo';
import { GlyphMap } from '../gameLogic/glyphs/glyphMap';
import { ImageHandler } from '../media/imageHandler/imageHandler';
import { MapCell } from '../maps/mapModel/mapCell';
import { MapRenderer } from './mapRenderer';
import { MessagesDisplay } from '../ui/messages/messagesDisplay';
import { MiscInfo } from '../ui/miscInfo/miscInfo';
import { TerminalPoint } from '../terminal/terminalPoint';
import { WorldPoint } from '../maps/mapModel/worldPoint';

/**
 * Handles drawing/updating the game map and UI elements.
 */
export class DrawUI {
  static outside: MapCell = new MapCell(Glyph.Unknown);
  /**
   * Draws a map on a drawable terminal. The whole map is visible.
   * @param {DrawableTerminal} term - The drawable terminal to draw on.
   * @param {GameMapType} map - The map to draw.
   * @param {WorldPoint} vp - The viewport representing the point in the world where drawing starts.
   */
  private static drawMapFullyVisible(
    term: DrawableTerminal,
    map: GameMapType,
    vp: WorldPoint,
  ) {
    const terminalDimensions = term.dimensions;
    const t = new TerminalPoint();
    const w = new WorldPoint();
    const mapOffSet = 0;

    // Loop through each row and column of the terminal
    for (
      t.y = mapOffSet, w.y = vp.y;
      t.y < terminalDimensions.y + mapOffSet;
      ++t.y, ++w.y
    ) {
      // Loop through each column of the terminal
      for (t.x = 0, w.x = vp.x; t.x < terminalDimensions.x; ++t.x, ++w.x) {
        // Get the cell from the map corresponding to the world point
        const cell: MapCell = map.isLegalPoint(w) ? map.cell(w) : this.outside;
        // Get the glyph info for the cell's glyph
        const i: GlyphInfo = GlyphMap.getGlyphInfo(cell.glyph());
        // Draw the glyph on the terminal
        term.drawAt(t.x, t.y, i.char, i.fgCol, i.bgCol);
      }
    }
  }

  /**
   * Draws a map with considerations for player position and lighting conditions.
   * @param {DrawableTerminal} term - The drawable terminal to draw on.
   * @param {GameMapType} map - The map to draw.
   * @param {WorldPoint} vp - The viewport representing the point in the world where drawing starts.
   * @param {WorldPoint} playerPos - The position of the player.
   * @param {GameState} game - The game object.
   */
  private static drawMap(
    term: DrawableTerminal,
    map: GameMapType,
    vp: WorldPoint,
    playerPos: WorldPoint,
    game: GameState,
  ) {
    MapRenderer.drawMap_RayCast(term, map, vp, playerPos, game);
  }

  /**
   * Draw the map with the player centered.
   *
   * @param {DrawableTerminal} term - the terminal to draw on
   * @param {GameMapType} map - the map to draw
   * @param {WorldPoint} player_pos - the position of the player
   * @param {GameState} game - the game interface
   */
  public static drawMapWithPlayerCentered(
    term: DrawableTerminal,
    map: GameMapType,
    playerPos: WorldPoint,
    game: GameState,
  ) {
    if (!playerPos) playerPos = new WorldPoint();

    const viewport: WorldPoint = new WorldPoint(
      -Math.floor(term.dimensions.x * 0.5) + playerPos.x,
      -Math.floor(term.dimensions.y * 0.5) + playerPos.y,
    );
    this.drawMap(term, map, viewport, playerPos, game);
  }

  /**
   * Renders miscellaneous information about the game state, such as the current dungeon level and player status,
   * to the appropriate UI element on the page.
   *
   * @param {GameState} game - The current game state containing information about the dungeon.
   * @return {void}
   */

  public static renderMiscInfo(game: GameState): void {
    const lvl = game.dungeon.level;

    const miscInfoDisplay = document.querySelector('misc-info') as MiscInfo;
    if (miscInfoDisplay) {
      miscInfoDisplay.setLevelInfo(lvl);
      miscInfoDisplay.setPlayerHPStatus(game.player);
    }
  }

  /**
   * Renders the active buffs of the player on the terminal.
   *
   * @param {GameState} game - the game instance containing the player's buffs
   * @return {void}
   */
  public static renderBuffs(game: GameState): void {
    const playerBuffs = game.player.buffs;
    const buffMap = playerBuffs.getBuffsMap();

    const buffsDisplay = document.querySelector(
      'buffs-display',
    ) as BuffsDisplay;
    if (buffsDisplay) buffsDisplay.setBuffs(buffMap);
  }

  /**
   * Renders the equipment on the terminal based on the provided game state.
   *
   * @param {GameState} game - the game instance containing the equipment state
   * @return {void}
   */
  public static renderEquipment(game: GameState): void {
    const equipment = game.equipment;
    const equipmentDisplay = document.querySelector(
      'equipment-display',
    ) as EquipmentDisplay;
    if (equipmentDisplay) equipmentDisplay.setEquipment(equipment);
  }

  /**
   * Renders the log messages on the terminal.
   *
   * @param {GameState} game - the game instance to retrieve player stats from
   * @return {void}
   */
  public static renderMessage(game: GameState): void {
    const gameConfig = gameConfigManager.getConfig();
    const { log } = game;

    const messageCount = gameConfig.message_count;

    const messageLog = log.archive.slice(-messageCount);

    const messagesDisplay = document.querySelector(
      'messages-display',
    ) as MessagesDisplay;
    if (messagesDisplay) messagesDisplay.setMessages(messageLog);
  }

  /**
   * Handles displaying an image based on the current event in the game log.
   * @param {GameState} game - The game state containing the current event.
   * @return {void} This function does not return anything.
   */
  public static renderActionImage(game: GameState): void {
    const gameConfig = gameConfigManager.getConfig();
    const shouldShowImages = gameConfig.show_images;

    if (!shouldShowImages) return;

    const imageHandler = ImageHandler.getInstance();

    const currentEventCategory = game.log.currentEvent;

    switch (currentEventCategory) {
      case EventCategory.lvlChange:
        imageHandler.handleLevelImageDisplay(game);
        break;
      case EventCategory.attack:
        imageHandler.handleAttackImageDisplay(game);
        break;
      case EventCategory.mobDamage:
        imageHandler.handleAttackImageDisplay(game);
        break;
      case EventCategory.playerDamage:
        imageHandler.handleHurtImageDisplay(game);
        break;
      case EventCategory.mobDeath:
        imageHandler.handleSmileImageDisplay(game);
        break;
      case EventCategory.moving:
        imageHandler.handleMovingImageDisplay(game);
        break;
      case EventCategory.rangedAttack:
        imageHandler.handlePistolImageDisplay(game);
        break;
      case EventCategory.wait:
        imageHandler.handleNeutralImageDisplay(game);
        break;
      case EventCategory.playerDeath:
        imageHandler.handleDeathImageDisplay(game);
        break;
      default:
        break;
    }
  }

  /**
   * Handles displaying a flash message for queued messages in the log.
   * This function is called at the start of each turn and is responsible for
   * displaying any messages that were queued up during the previous turn.
   * @param {GameState} game - The game state containing the log.
   * @returns {void} This function does not return anything.
   */
  public static renderFlash(game: GameState): void {
    const { log } = game;

    if (!log) return;

    const queuedMessages = log.queue;
    const msgs = [];
    for (let i = 0; i < queuedMessages.length; i++) {
      const msg = new LogMessage(queuedMessages[i].message, EventCategory.none);
      msgs.push(msg);
    }

    log.clearQueue();

    const flashDisplay = document.querySelector(
      'flash-display',
    ) as FlashDisplay;

    if (flashDisplay) flashDisplay.setFlash(msgs, log);
  }

  /**
   * Clears the flash message on the screen.
   *
   * @param {GameState} game - The game instance to clear the flash message from.
   * @return {void} This function does not return anything.
   */
  public static clearFlash(game: GameState): void {
    const flashDisplay = document.querySelector(
      'flash-display',
    ) as FlashDisplay;
    if (flashDisplay) flashDisplay.clearFlash(game);
  }

  /**
   * Loops over each cell in the entire map and applies a given function.
   *
   * @param {GameMapType} map - The game map
   * @param {Function} callback - The function to apply to each cell
   */
  private static forEachCellInMap(
    map: GameMapType,
    callback: (w: WorldPoint, map: GameMapType) => void,
  ) {
    const mapDimensions = map.dimensions;
    const w = new WorldPoint();

    for (w.y = 0; w.y < mapDimensions.y; ++w.y) {
      for (w.x = 0; w.x < mapDimensions.x; ++w.x) {
        callback(w, map);
      }
    }
  }

  /**
   * Apply environment area effects to each cell in the map based on the given game state.
   *
   * @param {GameMapType} map - The game map to apply effects to
   * @return {void} This function does not return anything.
   */
  public static addDynamicEnvironmentAreaEffectsToCells(
    map: GameMapType,
  ): void {
    this.forEachCellInMap(map, (w, map) => {
      const cell = map.cell(w);
      EnvironmentChecker.addDynamicCellEffects(cell, w, map);
    });
  }

  /**
   * Debug draw the map on the terminal with the player's position centered. GameMapType is completely visible.
   *
   * @param {DrawableTerminal} term - the terminal to draw on
   * @param {GameMapType} map - the map to draw
   * @param {WorldPoint} playerPos - the position of the player
   */
  public static debugDrawMap(
    term: DrawableTerminal,
    map: GameMapType,
    playerPos: WorldPoint,
  ) {
    if (!playerPos) playerPos = new WorldPoint();

    const viewport: WorldPoint = new WorldPoint(
      -Math.floor(term.dimensions.x * 0.5) + playerPos.x,
      -Math.floor(term.dimensions.y * 0.5) + playerPos.y,
    );
    this.drawMapFullyVisible(term, map, viewport);
  }
}
