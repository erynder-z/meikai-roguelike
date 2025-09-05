import { BuffsDisplay } from '../ui/buffs/buffsDisplay';
import { DrawableTerminal } from '../shared-types/terminal/drawableTerminal';
import { EnvironmentChecker } from '../gameLogic/environment/environmentChecker';
import { EquipmentDisplay } from '../ui/equipment/equipmentDisplay';
import { EventCategory, LogMessage } from '../gameLogic/messages/logMessage';
import { FlashDisplay } from '../ui/flashDisplay/flashDisplay';
import { gameConfigManager } from '../gameConfigManager/gameConfigManager';
import { GameMapType } from '../shared-types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../shared-types/gameBuilder/gameState';
import { Glyph } from '../gameLogic/glyphs/glyph';
import { GlyphInfo } from '../gameLogic/glyphs/glyphInfo';
import { GlyphMap } from '../gameLogic/glyphs/glyphMap';
import { ImageHandler } from '../media/imageHandler/imageHandler';
import { LevelDepthInfo } from '../ui/miscInfo/levelDepthInfo';
import { LevelTemperatureInfo } from '../ui/miscInfo/levelTemperatureInfo';
import { MapCell } from '../maps/mapModel/mapCell';
import { MapRenderer } from './mapRenderer';
import { MessagesDisplay } from '../ui/messages/messagesDisplay';
import { PlayerHealthInfo } from '../ui/miscInfo/playerHealthInfo';
import { TerminalPoint } from '../terminal/terminalPoint';
import { WorldPoint } from '../maps/mapModel/worldPoint';

/**
 * Handles drawing/updating the game map and UI elements.
 */
export class DrawUI {
  private static outside: MapCell = new MapCell(Glyph.Unknown);
  private static readonly actionImageHandlerMap = new Map<
    EventCategory,
    (imageHandler: ImageHandler, game: GameState) => void
  >([
    [
      EventCategory.lvlChange,
      (handler, game) => handler.handleLevelImageDisplay(game),
    ],
    [
      EventCategory.attack,
      (handler, game) => handler.handleAttackImageDisplay(game),
    ],
    [
      EventCategory.mobDamage,
      (handler, game) => handler.handleAttackImageDisplay(game),
    ],
    [
      EventCategory.playerDamage,
      (handler, game) => handler.handleHurtImageDisplay(game),
    ],
    [
      EventCategory.mobDeath,
      (handler, game) => handler.handleSmileImageDisplay(game),
    ],
    [
      EventCategory.moving_UP,
      (handler, game) => handler.handleMovingImageDisplay(game, 'UP'),
    ],
    [
      EventCategory.moving_DOWN,
      (handler, game) => handler.handleMovingImageDisplay(game, 'DOWN'),
    ],
    [
      EventCategory.moving_LEFT,
      (handler, game) => handler.handleMovingImageDisplay(game, 'LEFT'),
    ],
    [
      EventCategory.moving_RIGHT,
      (handler, game) => handler.handleMovingImageDisplay(game, 'RIGHT'),
    ],
    [
      EventCategory.moving_UP_LEFT,
      (handler, game) => handler.handleMovingImageDisplay(game, 'UP_LEFT'),
    ],
    [
      EventCategory.moving_DOWN_LEFT,
      (handler, game) => handler.handleMovingImageDisplay(game, 'DOWN_LEFT'),
    ],
    [
      EventCategory.moving_UP_RIGHT,
      (handler, game) => handler.handleMovingImageDisplay(game, 'UP_RIGHT'),
    ],
    [
      EventCategory.moving_DOWN_RIGHT,
      (handler, game) => handler.handleMovingImageDisplay(game, 'DOWN_RIGHT'),
    ],
    [
      EventCategory.rangedAttack,
      (handler, game) => handler.handlePistolImageDisplay(game),
    ],
    [
      EventCategory.wait,
      (handler, game) => handler.handleNeutralImageDisplay(game),
    ],
    [
      EventCategory.playerDeath,
      (handler, game) => handler.handleDeathImageDisplay(game),
    ],
  ]);
  /**
   * Draws a map on a drawable terminal. The whole map is visible.
   *
   * @param term - The drawable terminal to draw on.
   * @param map - The map to draw.
   * @param vp - The viewport representing the point in the world where drawing starts.
   */
  private static drawMapFullyVisible(
    term: DrawableTerminal,
    map: GameMapType,
    vp: WorldPoint,
  ): void {
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
   *
   * @param term - The drawable terminal to draw on.
   * @param map - The map to draw.
   * @param vp - The viewport representing the point in the world where drawing starts.
   * @param playerPos - The position of the player.
   * @param game - The game object.
   */
  private static drawMap(
    term: DrawableTerminal,
    map: GameMapType,
    vp: WorldPoint,
    playerPos: WorldPoint,
    game: GameState,
  ): void {
    MapRenderer.drawMap_RayCast(term, map, vp, playerPos, game);
  }

  /**
   * Draw the map with the player centered.
   *
   * @param term - the terminal to draw on.
   * @param map - the map to draw.
   * @param player_pos - the position of the player.
   * @param game - the game interface.
   */
  public static drawMapWithPlayerCentered(
    term: DrawableTerminal,
    map: GameMapType,
    playerPos: WorldPoint,
    game: GameState,
  ): void {
    if (!playerPos) playerPos = new WorldPoint();

    const viewport: WorldPoint = new WorldPoint(
      -Math.floor(term.dimensions.x * 0.5) + playerPos.x,
      -Math.floor(term.dimensions.y * 0.5) + playerPos.y,
    );
    this.drawMap(term, map, viewport, playerPos, game);
  }

  /**
   * Updates the player's HP status in the UI.
   *
   * @param game - the game interface containing the player mob.
   */
  public static renderPlayerHealthInfo(game: GameState): void {
    const playerHealthInfo = document.querySelector(
      'player-health-info',
    ) as PlayerHealthInfo;
    if (playerHealthInfo) playerHealthInfo.setPlayerHPStatus(game.player);
  }

  /**
   * Updates the level depth information element in the UI.
   *
   * @param game - the game interface containing the current map.
   */
  public static renderLevelDepthInfo(game: GameState): void {
    const currentMap = game.currentMap();
    const currentDepth = currentMap?.depth || 0;
    const levelDepthInfo = document.querySelector(
      'level-depth-info',
    ) as LevelDepthInfo;
    if (levelDepthInfo) levelDepthInfo.setLevelDepthInfo(currentDepth);
  }

  /**
   * Updates the level temperature information element in the UI.
   *
   * @param game - the game interface containing the current map.
   */
  public static renderLevelTemperatureInfo(game: GameState): void {
    const currentMap = game.currentMap();
    const currentTemp = currentMap?.temperature || 0;
    const levelTempInfo = document.querySelector(
      'level-temperature-info',
    ) as LevelTemperatureInfo;
    if (levelTempInfo) levelTempInfo.setLevelTempInfo(currentTemp);
  }

  /**
   * Renders the active buffs of the player on the terminal.
   *
   * @param game - the game instance containing the player's buffs.
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
   * @param game - the game instance containing the equipment state.
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
   * @param game - the game instance to retrieve player stats from.
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
   *
   * @param game - The game state containing the current event.
   */
  public static renderActionImage(game: GameState): void {
    const gameConfig = gameConfigManager.getConfig();
    const shouldShowImages = gameConfig.show_images;

    if (!shouldShowImages) return;

    const imageHandler = ImageHandler.getInstance();

    const currentEventCategory = game.log.currentEvent;

    const handler = this.actionImageHandlerMap.get(currentEventCategory);
    if (handler) handler(imageHandler, game);
  }

  /**
   * Handles displaying a flash message for queued messages in the log.
   * This function is called at the start of each turn and is responsible for
   * displaying any messages that were queued up during the previous turn.
   *
   * @param game - The game state containing the log.
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
   * @param game - The game instance to clear the flash message from.
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
   * @param map - The game map.
   * @param callback - The function to apply to each cell.
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
   * @param map - The game map to apply effects to.
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
   * @param term - the terminal to draw on.
   * @param map - the map to draw.
   * @param playerPos - the position of the player.
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
