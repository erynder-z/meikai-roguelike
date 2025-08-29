import { Buff } from '../buffs/buffEnum';
import { BuffCommand } from './buffCommand';
import { ChasmHandler } from '../../maps/helpers/chasmHandler';
import { GameMapType } from '../../types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../../types/gameBuilder/gameState';
import { Glyph } from '../glyphs/glyph';
import { HealCommand } from './healCommand';
import { MapCell } from '../../maps/mapModel/mapCell';
import { Mob } from '../mobs/mob';
import { NebulousMistHandler } from '../../maps/helpers/nebulousMistHandler';
import { StatChangeBuffCommand } from './statChangeBuffCommand';
import { WaterHandler } from '../../maps/helpers/waterHandler';

type StandardBuffEffect = {
  condition: (cell: MapCell) => boolean;
  buff: Buff;
  specialGlyph?: Glyph;
};

type StatChangeBuffEffect = {
  condition: (cell: MapCell) => boolean;
  buff: Buff;
};

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
   */
  public applyCellEffects(): void {
    this.applyStandardBuffs();
    if (!this.me.isAlive()) return;

    this.applyStatChangeBuffs();
    if (!this.me.isAlive()) return;

    this.applyOtherEffects();
    if (!this.me.isAlive()) return;

    this.applyEnvironmentHandlers();
  }

  /**
   * Applies standard buffs to the mob based on the cell it is in. A standard buff is one that applies a buff to the mob
   * based on a condition of the cell. If the cell has a special glyph associated with it, the buff is not applied.
   */
  private applyStandardBuffs(): void {
    const standardBuffs: StandardBuffEffect[] = [
      {
        condition: cell => cell.isCausingSlow(),
        buff: Buff.Slow,
        specialGlyph: Glyph.Shallow_Water,
      },
      { condition: cell => cell.isCausingBurn(), buff: Buff.Lava },
      { condition: cell => cell.isCausingBleed(), buff: Buff.Bleed },
      { condition: cell => cell.isCausingPoison(), buff: Buff.Poison },
      { condition: cell => cell.isCausingConfusion(), buff: Buff.Confuse },
      {
        condition: cell => cell.isCausingBlind(),
        buff: Buff.Blind,
        specialGlyph: Glyph.Nebulous_Mist,
      },
    ];

    for (const { condition, buff, specialGlyph } of standardBuffs) {
      if (condition(this.cell)) {
        if (specialGlyph && this.cell.env === specialGlyph) {
          continue;
        }
        const duration = this.cell.environment.defaultBuffDuration || 5;
        new BuffCommand(buff, this.me, this.game, this.me, duration).execute();
        if (!this.me.isAlive()) return;
      }
    }
  }

  /**
   * Applies stat change buffs to the mob based on the cell it is in. A stat change buff is one that changes a stat of the mob
   * based on a condition of the cell.
   */
  private applyStatChangeBuffs(): void {
    const statChangeBuffs: StatChangeBuffEffect[] = [
      { condition: cell => cell.isCausingAttackUp(), buff: Buff.AttackUp },
      {
        condition: cell => cell.isCausingAttackDown(),
        buff: Buff.AttackDown,
      },
      { condition: cell => cell.isCausingDefenseUp(), buff: Buff.DefenseUp },
      {
        condition: cell => cell.isCausingDefenseDown(),
        buff: Buff.DefenseDown,
      },
    ];

    for (const { condition, buff } of statChangeBuffs) {
      if (condition(this.cell)) {
        const duration = 50;
        const amount = this.game.rand.randomFloatInclusive(0, 1);
        new StatChangeBuffCommand(
          buff,
          this.me,
          this.game,
          this.me,
          amount,
          duration,
        ).execute();
        if (!this.me.isAlive()) return;
      }
    }
  }

  /**
   * Applies other cell effects to the mob, such as healing.
   */
  private applyOtherEffects(): void {
    if (this.cell.isHealing()) {
      const randomAmount = this.game.rand.randomIntegerExclusive(
        1,
        this.me.maxhp,
      );
      new HealCommand(randomAmount, this.me, this.game).execute();
    }
  }

  /**
   * Applies cell effects that handle the mob's environment, such as whether it is in water, mist, or a chasm.
   *
   * If the mob is in water, it will be healed. If it is leaving water, any active Burn or Lava buffs will be removed.
   * If it is in mist, it will be blinded. If it is leaving mist, the blind buff will be removed.
   * If it is in a chasm, it will be killed.
   */
  private applyEnvironmentHandlers(): void {
    if (this.cell.isWater()) {
      WaterHandler.handleWaterCellEffect(this.me, this.game);
    } else {
      WaterHandler.handleLeavingWater(this.me, this.game);
    }
    if (!this.me.isAlive()) return;

    if (this.cell.isNebulousMist()) {
      NebulousMistHandler.handleNebulousMistCellEffect(this.me, this.game);
    } else {
      NebulousMistHandler.handleLeavingNebulousMist(this.me, this.game);
    }
    if (!this.me.isAlive()) return;

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
