import { Glyph } from '../../../gameLogic/glyphs/glyph';
import { ObjCategory } from '../../../gameLogic/itemObjects/itemCategories';
import { Slot } from '../../../gameLogic/itemObjects/slot';

export type ItemDefinitionJson = {
  id: string;
  glyph: string;
  char: string;
  bgCol: string;
  fgCol: string;
  hasSolidBg: boolean;
  name: string;
  description: string;
  category: string[];
  slot: string;
  help: {
    show: boolean;
    about: string;
  };
};

export type ItemTemplate = {
  glyph: Glyph;
  slot: Slot;
  category: ObjCategory[];
};
