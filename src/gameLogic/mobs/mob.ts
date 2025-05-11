import { ActiveBuffs } from '../buffs/activeBuffs';
import { Buff } from '../buffs/buffEnum';
import { Glyph } from '../glyphs/glyph';
import { Mood } from './moodEnum';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Represents a mobile entity within the game world. Mob can be either a player or an NPC.
 */
export class Mob {
  public id: string;
  public pos: WorldPoint = new WorldPoint();
  public glyph: Glyph = Glyph.Unknown;
  public name: string = '?';
  public description: string = '';
  public hp: number = 3;
  public maxhp: number = 3;
  public mood: Mood = Mood.Asleep;
  public level: number = 0;
  public sinceMove: number = 0;
  public isPlayer: boolean = false;
  public buffs: ActiveBuffs = new ActiveBuffs();
  public bloody: { isBloody: boolean; intensity: number } = {
    isBloody: false,
    intensity: 0,
  };
  public strength: number = 1.0;

  constructor(glyph: Glyph, x: number, y: number) {
    this.isPlayer = glyph == Glyph.Player;
    this.glyph = glyph;
    this.id = Glyph[glyph];
    this.name = Glyph[glyph];
    this.pos.x = x;
    this.pos.y = y;
    this.id = crypto.randomUUID();
  }

  public is(buff: Buff): boolean {
    return this.buffs.is(buff);
  }

  /**
   * A function that checks if the entity is alive.
   *
   * @return {boolean} the status of the entity
   */
  public isAlive(): boolean {
    return this.hp > 0;
  }
}
