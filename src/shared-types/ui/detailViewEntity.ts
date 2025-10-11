import { Glyph } from '../../gameLogic/glyphs/glyph';
import { Spell } from '../../gameLogic/spells/spell';
import { EnvEffect } from '../gameLogic/maps/mapModel/envEffect';

export type DetailViewEntity = {
  type: 'mob' | 'item' | 'env' | 'corpse' | 'unknown';
  glyph: Glyph;
  name: string;
  description: string;
  sprite?: string;
  level?: number;
  weight?: number;
  hp?: number;
  maxHp?: number;
  charges?: number;
  spell?: Spell;
  envEffects?: EnvEffect[];
};
