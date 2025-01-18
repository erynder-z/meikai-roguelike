import { EnvEffect } from '../gameLogic/maps/mapModel/envEffect';
import { Glyph } from '../../gameLogic/glyphs/glyph';
import { Spell } from '../../gameLogic/spells/spell';

export type LookScreenEntity = {
  type: 'mob' | 'item' | 'env' | 'corpse' | 'unknown';
  glyph: Glyph;
  name: string;
  description: string;
  sprite?: string;
  level?: number;
  hp?: number;
  maxHp?: number;
  charges?: number;
  spell?: Spell;
  envEffects?: EnvEffect[];
};
