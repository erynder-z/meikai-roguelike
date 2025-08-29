import { BaseScreen } from './baseScreen';
import { Buff } from '../buffs/buffEnum';
import { CanSee } from '../../maps/helpers/canSee';
import { DetailViewHandler } from '../../ui/detailVIewHandler/detailViewHandler';
import { DrawableTerminal } from '../../types/terminal/drawableTerminal';
import { DrawUI } from '../../renderer/drawUI';
import { EntityInfoCard } from '../../ui/entityInfoDisplay/entityInfoCard';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameState } from '../../types/gameBuilder/gameState';
import { GameMapType } from '../../types/gameLogic/maps/mapModel/gameMapType';
import { DetailViewEntity } from '../../types/ui/detailViewEntity';
import { MapCell } from '../../maps/mapModel/mapCell';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../types/terminal/stack';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Represents a screen for looking at the player's surroundings.
 */
export class LookScreen extends BaseScreen {
  public name = 'look-screen';
  public keyBindings: Map<string, DetailViewEntity> = new Map();
  private readonly neutralPos = new WorldPoint(
    Math.floor(this.gameConfig.terminal.dimensions.width * 0.5),
    Math.floor(this.gameConfig.terminal.dimensions.height * 0.5),
  );
  private readonly playerPos = new WorldPoint(
    this.game.player.pos.x,
    this.game.player.pos.y,
  );
  private cursorPos: WorldPoint;
  private lookPos: WorldPoint;

  constructor(game: GameState, make: ScreenMaker) {
    super(game, make);
    this.cursorPos = this.neutralPos;
    this.lookPos = this.playerPos;
  }

  /**
   * Draws the look screen on the provided drawable terminal.
   *
   * The look screen displays the cell information at the position of the player
   * and draws an overlay cursor at the position of the cursor.
   *
   * @param term - The terminal to draw on.
   */
  public drawScreen(term: DrawableTerminal): void {
    const cursorBgCol = '#F0F8FF';
    const opacityFactor = 0.3;
    const cursorEdgeCol = '#F0F8FF';
    const borderThickness = 5;
    const cornerSize = 1;

    super.drawScreen(term);
    term.drawOverlayCursor(
      this.cursorPos.x,
      this.cursorPos.y,
      cursorBgCol,
      opacityFactor,
      cursorEdgeCol,
      borderThickness,
      cornerSize,
    );

    const s = this.getCellInfo(this.lookPos.x, this.lookPos.y);
    if (s) this.displayInfo(s);
  }

  /**
   * Determines if a point is visible on the map based on player position, game stats, and visibility buffs.
   *
   * @param pos - The position of the point to check for visibility.
   * @param map - The map object containing the point.
   * @param playerPos - The position of the player.
   * @param game - The game object containing the player and game stats.
   * @return Returns true if the point is visible, false otherwise.
   */
  private isPointVisible(
    pos: WorldPoint,
    map: GameMapType,
    playerPos: WorldPoint,
    game: GameState,
  ): boolean {
    const { buffs } = game.player;
    const isBlind = buffs && (buffs.is(Buff.Blind) || buffs.is(Buff.NebulousMist));
    const farDist = CanSee.getFarDist(playerPos, map, game);

    return (
      !isBlind &&
      CanSee.isDistanceSmallerThan(pos, playerPos, farDist) &&
      CanSee.checkPointLOS_RayCast(playerPos, pos, map)
    );
  }

  /**
   * Retrieves information about a cell at the specified coordinates.
   *
   * @param x - The x-coordinate of the cell.
   * @param y - The y-coordinate of the cell.
   * @return The information about the cell. Returns 'Not visible!' if the cell is not visible.
   */
  private getCellInfo(x: number, y: number): string | null {
    const point = new WorldPoint(x, y);
    const map = this.game.currentMap()!;
    const playerPosition = this.game.player.pos;
    const cell = map.cell(point);
    const isVisible = this.isPointVisible(
      point,
      map,
      playerPosition,
      this.game,
    );

    if (isVisible) {
      return this.generateMessageVisibleCell(cell);
    } else {
      return this.generateMessageNotVisibleCell();
    }
  }

  /**
   * Generates a message describing the contents of a cell if it is visible.
   *
   * @param cell - The cell to generate the message for.
   * @return The generated message.
   */
  private generateMessageVisibleCell(cell: MapCell): string {
    const entities: { uniqueKey: string; entity: DetailViewEntity }[] = [];
    const { mob, corpse, obj, environment } = cell;
    const detailViewHandler = new DetailViewHandler();

    const isDownstairs = this.game
      .currentMap()
      ?.downStairPos?.isEqual(this.lookPos);
    const isUpstairs = this.game
      .currentMap()
      ?.upStairPos?.isEqual(this.lookPos);

    const usedLetters = new Set<string>();

    /**
     * Adds key letters from the given control scheme to the usedLetters set.
     *
     * @para controlScheme - The control scheme object where each key is a control name and its value is an array of string key letters.
     */
    const addControlSchemeKeyLetters = (
      controlScheme: Record<string, string[]>,
    ) => {
      const controlSchemeKeyLetters: string[] =
        Object.values(controlScheme).flat();

      controlSchemeKeyLetters.map(key => {
        usedLetters.add(key);
      });
    };

    /**
     * Returns a unique letter (a lowercase character) not present in the given control scheme or usedLetters set.
     *
     * @param name - The name from which to generate a unique letter.
     * @return The generated unique letter. If no unique letter can be generated, returns '*'.
     */
    const getUniqueLetter = (name: string): string => {
      addControlSchemeKeyLetters(this.activeControlScheme);
      for (const char of name.toLowerCase()) {
        if (!usedLetters.has(char)) {
          usedLetters.add(char);
          return char;
        }
      }
      return '*';
    };

    /**
     * Adds a DetailViewEntity to the list of entities to be displayed. It also
     * adds a binding to the keyBindings map for the entity, where the key is
     * a unique letter generated from the name of the entity.
     *
     * @param name - The name of the entity to be added.
     * @param entity - The DetailViewEntity to be added.
     */
    const addEntity = (name: string, entity: DetailViewEntity) => {
      const letter = getUniqueLetter(name).toLowerCase();
      entities.push({ uniqueKey: letter, entity });
      this.keyBindings.set(letter, entity);
    };

    if (mob)
      addEntity(mob.name, detailViewHandler.transformIntoDetailViewEntity(mob));
    if (corpse)
      addEntity(
        corpse.name,
        detailViewHandler.transformIntoDetailViewEntity(corpse),
      );
    if (obj)
      addEntity(
        obj.name(),
        detailViewHandler.transformIntoDetailViewEntity(obj),
      );

    const environmentKey = getUniqueLetter(environment.name).toLowerCase();
    const environmentDesc = `${environment.name.toLowerCase()} (${environmentKey})`;
    this.keyBindings.set(
      environmentKey,
      detailViewHandler.transformIntoDetailViewEntity(environment),
    );

    let message = 'You see: ';

    if (entities.length > 0) {
      const entityDescriptions = entities
        .map(
          e =>
            `${e.entity.name === this.game.player.name ? '' : 'a '} ${e.entity.name} (${e.uniqueKey})`,
        )
        .join(' and ')
        .concat(` on ${environmentDesc}.`);
      message += this.capitalizeFirstLetter(entityDescriptions);
    } else {
      message += this.capitalizeFirstLetter(`${environmentDesc}.`);
    }

    if (isDownstairs) message = 'You see: A way leading downwards.';
    if (isUpstairs) message = 'You see: A way leading upwards.';

    return message;
  }

  /**
   * Retrieves information about a cell that is not visible.
   *
   * @return The information about the cell.
   */
  private generateMessageNotVisibleCell(): string {
    return 'Not visible from where you are!';
  }

  /**
   * Capitalizes the first letter of a string.
   *
   * @param str - The string to capitalize.
   * @return The capitalized string.
   */
  private capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Displays the provided information on the screen.
   *
   * @param s - The information to display.
   */
  private displayInfo(s: string): void {
    DrawUI.clearFlash(this.game);

    const msg = new LogMessage(s, EventCategory.look);
    this.game.flash(msg);

    DrawUI.renderFlash(this.game);
  }

  /**
   * Displays detailed information about a given entity by creating and appending
   * an 'entity-info-card' element to the 'canvas-container'.
   *
   * @param entity - The DetailViewEntity containing the information to be displayed.
   */
  private showEntityDetail(entity: DetailViewEntity): void {
    const canvasContainer = document.getElementById('canvas-container');
    const entityCard = document.createElement(
      'entity-info-card',
    ) as EntityInfoCard;

    if (canvasContainer) canvasContainer.appendChild(entityCard);
    entityCard.id = 'entity-info-card';
    entityCard.fillCardDetails(entity);
  }

  /**
   * Handles key down events for navigating the look screen and interacting with entities.
   *
   * @param event - The keyboard event triggered by user input.
   * @param stack - The stack of screens, used to manage screen transitions.
   */
  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): void {
    const detailViewHandler = new DetailViewHandler();
    const isEntityCardOpen = detailViewHandler.isEntityCardOpen();
    if (isEntityCardOpen) detailViewHandler.closeOpenEntityCard();

    const moveCursor = (dx: number, dy: number) => {
      this.cursorPos.x += dx;
      this.cursorPos.y += dy;
      this.lookPos.x += dx;
      this.lookPos.y += dy;
    };

    const char = this.controlSchemeManager.keyPressToCode(event);

    if (this.keyBindings.has(char)) {
      const entity = this.keyBindings.get(char)!;
      this.showEntityDetail(entity);
      return;
    }

    this.keyBindings.clear();

    switch (char) {
      case this.activeControlScheme.move_left.toString():
        moveCursor(-1, 0);
        break;
      case this.activeControlScheme.move_right.toString():
        moveCursor(1, 0);
        break;
      case this.activeControlScheme.move_up.toString():
        moveCursor(0, -1);
        break;
      case this.activeControlScheme.move_down.toString():
        moveCursor(0, 1);
        break;
      case this.activeControlScheme.move_up_left.toString():
        moveCursor(-1, -1);
        break;
      case this.activeControlScheme.move_up_right.toString():
        moveCursor(1, -1);
        break;
      case this.activeControlScheme.move_down_left.toString():
        moveCursor(-1, 1);
        break;
      case this.activeControlScheme.move_down_right.toString():
        moveCursor(1, 1);
        break;
      case this.activeControlScheme.menu.toString():
        DrawUI.clearFlash(this.game);
        stack.pop();
        break;
    }
  }
}
