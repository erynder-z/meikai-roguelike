import { GameMap } from '../../maps/mapModel/gameMap';
import { GameMapType } from '../../types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../../types/gameBuilder/gameState';
import { Glyph } from '../glyphs/glyph';
import { MagnetismHandler } from '../../utilities/magnetismHandler';
import { Step } from '../../types/gameLogic/stepper/step';
import { TimedStep } from './timedStep';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Represents a timed step that moves an object in a specified direction.
 */
export class DirectionStep extends TimedStep {
  constructor(
    public effect: Step | null,
    public next: Step | null,
    public sprite: Glyph,
    public pos: WorldPoint,
    public g: GameState,
    public map: GameMapType = <GameMapType>g.currentMap(),
    public direction: WorldPoint | null = null,
  ) {
    super();
  }

  /**
   * Sets the direction of the object to the specified world point.
   *
   * @param {WorldPoint} dir - The world point to set the direction to.
   * @return {void} This function does not return anything.
   */
  public setDirection(dir: WorldPoint): void {
    this.direction = dir;
  }

  /**
   * Executes the step for moving an object in a specified direction.
   *
   * @return {Step | null} The next step to execute or null if the current step is done.
   */
  public executeStep(): Step | null {
    const currentPosition = this.pos;
    const map = <GameMap>this.map;

    map.cell(currentPosition).sprite = undefined;

    if (this.direction == null) throw 'no dir';

    const newPosition = currentPosition.plus(this.direction);

    const canGetStuckInWall = true; // Determines whether a magnet can pull an entity towards a wall and using a turn. Bullets and payloads should set this to true.
    const magnetizedPos = MagnetismHandler.getMagnetizedPosition(
      map,
      currentPosition,
      newPosition,
      this.g.rand,
      canGetStuckInWall,
    );

    if (magnetizedPos) {
      currentPosition.addTo(magnetizedPos);
    } else {
      currentPosition.addTo(this.direction);
    }

    if (!map.isLegalPoint(currentPosition)) return null;

    const cell = map.cell(currentPosition);
    const done = cell.isBlockingProjectiles();

    if (!done) {
      cell.sprite = this.sprite;

      if (this.effect) {
        this.effect.setPos(currentPosition);
        this.effect.executeStep();
      }
    } else {
      if (this.next) this.next.setPos(currentPosition);
    }
    return done ? this.next : this;
  }
}
