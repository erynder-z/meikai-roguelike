import { WorldPoint } from '../../maps/mapModel/worldPoint';
import { ActiveBuffs } from '../buffs/activeBuffs';
import { Buff } from '../buffs/buffEnum';
import { Glyph } from '../glyphs/glyph';
import { Mood } from './moodEnum';

/**
 * Represents a mobile entity within the game world. Mob can be either a player or an NPC.
 */
export class Mob {
  public id: string;
  public pos: WorldPoint;
  public name: string;
  public description: string = '';
  public hp: number = 3;
  public maxhp: number = 3;
  public mood: Mood = Mood.Asleep;
  public level: number = 0;
  public sinceMove: number = 0;
  public isPlayer: boolean;
  public buffs: ActiveBuffs = new ActiveBuffs();
  public bloody: { isBloody: boolean; intensity: number } = {
    isBloody: false,
    intensity: 0,
  };
  public baseStrength: number = 4;
  public currentStrength: number = 4;

  constructor(
    public glyph: Glyph,
    x: number,
    y: number,
  ) {
    this.id = crypto.randomUUID();
    this.pos = new WorldPoint(x, y);
    this.name = Glyph[glyph];
    this.isPlayer = glyph == Glyph.Player;
  }

  /**
   * Determines if a specific type of buff is currently active on this mob.
   *
   * @param buff - The buff to check for.
   * @returns True if the buff is active, false otherwise.
   */
  public is(buff: Buff): boolean {
    return this.buffs.is(buff);
  }

  /**
   * A function that checks if the entity is alive.
   *
   * @return The status of the entity
   */
  public isAlive(): boolean {
    return this.hp > 0;
  }
}
