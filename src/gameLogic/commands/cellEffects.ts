import { Buff } from '../buffs/buffEnum';
import { BuffCommand } from './buffCommand';
import { ChasmHandler } from '../../maps/helpers/chasmHandler';
import { GameMapType } from '../../types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../../types/gameBuilder/gameState';
import { Glyph } from '../glyphs/glyph';
import { HealCommand } from './healCommand';
import { MapCell } from '../../maps/mapModel/mapCell';
import { Mob } from '../mobs/mob';
import { StatChangeBuffCommand } from './statChangeBuffCommand';
import { WaterHandler } from '../../maps/helpers/waterHandler';

/**
 * Manages adding effects to a mob at a given position.
 */
export class CellEffects {
  constructor(
    public me: Mob,
    public game: GameState,
    public map: GameMapType,
    public cell: MapCell,
  ) {}

  /**
   * Applies cell effects based on the given map and position.
   *
   * @return {void} This function does not return anything.
   */
  public applyCellEffects(): void {
    if (this.cell.isCausingSlow()) {
      if (this.cell.env !== Glyph.Shallow_Water) {
        // Shallow water is handled in this.handleWater()
        const duration = this.cell.environment.defaultBuffDuration || 5;
        new BuffCommand(
          Buff.Slow,
          this.me,
          this.game,
          this.me,
          duration,
        ).execute();
        if (!this.me.isAlive()) return;
      }
    }
    if (this.cell.isCausingBurn()) {
      const duration = this.cell.environment.defaultBuffDuration || 5;
      new BuffCommand(
        Buff.Lava,
        this.me,
        this.game,
        this.me,
        duration,
      ).execute();
      if (!this.me.isAlive()) return;
    }
    if (this.cell.isCausingBleed()) {
      const duration = this.cell.environment.defaultBuffDuration || 5;
      new BuffCommand(
        Buff.Bleed,
        this.me,
        this.game,
        this.me,
        duration,
      ).execute();
      if (!this.me.isAlive()) return;
    }
    if (this.cell.isCausingPoison()) {
      const duration = this.cell.environment.defaultBuffDuration || 5;
      new BuffCommand(
        Buff.Poison,
        this.me,
        this.game,
        this.me,
        duration,
      ).execute();
    }
    if (this.cell.isCausingConfusion()) {
      const duration = this.cell.environment.defaultBuffDuration || 5;
      new BuffCommand(
        Buff.Confuse,
        this.me,
        this.game,
        this.me,
        duration,
      ).execute();
      if (!this.me.isAlive()) return;
    }

    if (this.cell.isCausingBlind()) {
      const duration = this.cell.environment.defaultBuffDuration || 5;
      new BuffCommand(
        Buff.Blind,
        this.me,
        this.game,
        this.me,
        duration,
      ).execute();
      if (!this.me.isAlive()) return;
    }

    if (this.cell.isCausingAttackUp()) {
      const duration = 50;
      const amount = this.game.rand.randomFloat(0, 1);

      new StatChangeBuffCommand(
        Buff.AttackUp,
        this.me,
        this.game,
        this.me,
        amount,
        duration,
      ).execute();
      if (!this.me.isAlive()) return;
    }

    if (this.cell.isCausingAttackDown()) {
      const duration = 50;
      const amount = this.game.rand.randomFloat(0, 1);

      new StatChangeBuffCommand(
        Buff.AttackDown,
        this.me,
        this.game,
        this.me,
        amount,
        duration,
      ).execute();
      if (!this.me.isAlive()) return;
    }

    if (this.cell.isCausingDefenseUp()) {
      const duration = 50;
      const amount = this.game.rand.randomFloat(0, 1);

      new StatChangeBuffCommand(
        Buff.DefenseUp,
        this.me,
        this.game,
        this.me,
        amount,
        duration,
      ).execute();
      if (!this.me.isAlive()) return;
    }

    if (this.cell.isCausingDefenseDown()) {
      const duration = 50;
      const amount = this.game.rand.randomFloat(0, 1);

      new StatChangeBuffCommand(
        Buff.DefenseDown,
        this.me,
        this.game,
        this.me,
        amount,
        duration,
      ).execute();
      if (!this.me.isAlive()) return;
    }

    if (this.cell.isHealing()) {
      const randomAmount = this.game.rand.randomInteger(1, this.me.maxhp);
      new HealCommand(randomAmount, this.me, this.game).execute();
    }

    if (this.cell.isWater()) {
      WaterHandler.handleWaterCellEffect(this.me, this.game);
      if (!this.me.isAlive()) return;
    }
    if (this.cell.isChasmEdge()) {
      ChasmHandler.handleChasmEdge(this.me, this.game);
      if (!this.me.isAlive()) return;
    }
    if (this.cell.isChasmCenter()) {
      ChasmHandler.handleChasmCenter(this.me, this.game);
      if (!this.me.isAlive()) return;
    }
  }
}
