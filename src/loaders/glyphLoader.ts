import corpseData from '../gameLogic/mobs/mobData/corpses.json';
import environmentData from '../gameLogic/environment/environmentData/environment.json';
import itemData from '../gameLogic/itemObjects/itemData/items.json';
import mobsData from '../gameLogic/mobs/mobData/mobs.json';
import { gameConfigManager } from '../gameConfigManager/gameConfigManager';
import { GlyphInfo } from '../gameLogic/glyphs/glyphInfo';
import { GlyphMap } from '../gameLogic/glyphs/glyphMap';

type BaseGlyph = {
  id: string;
  char: string;
  bgCol: string;
  fgCol: string;
  hasSolidBg: boolean;
  name: string;
  description: string;
  help?: {
    show: boolean;
    about: string;
  };
};

type EnvironmentGlyph = {
  isOpaque: boolean;
  isBlockingMovement: boolean;
  isBlockingProjectiles: boolean;
  isDiggable: boolean;
  isCausingSlow: boolean;
  isCausingBurn: boolean;
  isMagnetic: boolean;
  isCausingBleed: boolean;
  isGlowing: boolean;
  isCausingPoison: boolean;
  isCausingConfusion: boolean;
  isCausingBlind: boolean;
  defaultBuffDuration?: number;
} & BaseGlyph;

/**
 * Responsible for loading and initializing glyphs into the GlyphMap.
 */
export class GlyphLoader {
  /**
   * Initializes all glyphs by loading data from various sources.
   *
   * @return The number of glyphs initialized.
   */
  public static async initializeGlyphs(): Promise<number> {
    const gameConfig = gameConfigManager.getConfig();
    return new Promise((resolve, reject) => {
      try {
        // Add player glyph
        const playerGlyph = new GlyphInfo(
          'Player', // id
          gameConfig.player.color, // fgCol
          '#4B5A52', // bgCol
          false, // hasSolidBg
          gameConfig.player.avatar, // char
          gameConfig.player.name, // name
          'The player character. You are here.', // description
          true, // isOpaque
          false, // isBlockingMovement
          false, // isBlockingProjectiles
          false, // isDiggable
          false, // isCausingSlow
          false, // isCausingBurn
          false, // isMagnetic
          false, // isCausingBleed
          false, // isGlowing
          false, // isCausingPoison
          false, // isCausingConfusion
          false, // isCausingBlind
          0, // defaultBuffDuration
        );
        GlyphMap.addGlyph(playerGlyph);

        // Load environment glyphs
        environmentData.environment.forEach((env: EnvironmentGlyph) => {
          const envGlyph = new GlyphInfo(
            env.id,
            env.fgCol,
            env.bgCol,
            env.hasSolidBg,
            env.char,
            env.name,
            env.description,
            env.isOpaque,
            env.isBlockingMovement,
            env.isBlockingProjectiles,
            env.isDiggable,
            env.isCausingSlow,
            env.isCausingBurn,
            env.isMagnetic,
            env.isCausingBleed,
            env.isGlowing,
            env.isCausingPoison,
            env.isCausingConfusion,
            env.isCausingBlind,
            env.defaultBuffDuration,
            env.help, // Optional
          );
          GlyphMap.addGlyph(envGlyph);
        });

        // Load mob glyphs
        mobsData.mobs.forEach((mob: BaseGlyph) => {
          const mobGlyph = new GlyphInfo(
            mob.id,
            mob.fgCol,
            mob.bgCol,
            mob.hasSolidBg,
            mob.char,
            mob.name,
            mob.description,
            false, // isOpaque
            false, // isBlockingMovement
            false, // isBlockingProjectiles
            false, // isDiggable
            false, // isCausingSlow
            false, // isCausingBurn
            false, // isMagnetic
            false, // isCausingBleed
            false, // isGlowing
            false, // isCausingPoison
            false, // isCausingConfusion
            false, // isCausingBlind
            0, // defaultBuffDuration
            mob.help, // Optional
          );
          GlyphMap.addGlyph(mobGlyph);
        });

        // Load item glyphs
        itemData.items.forEach((item: BaseGlyph) => {
          const itemGlyph = new GlyphInfo(
            item.id,
            item.fgCol,
            item.bgCol,
            item.hasSolidBg,
            item.char,
            item.name,
            item.description,
            false, // isOpaque
            false, // isBlockingMovement
            false, // isBlockingProjectiles
            false, // isDiggable
            false, // isCausingSlow
            false, // isCausingBurn
            false, // isMagnetic
            false, // isCausingBleed
            false, // isGlowing
            false, // isCausingPoison
            false, // isCausingConfusion
            false, // isCausingBlind
            0, // defaultBuffDuration
            item.help, // Optional
          );
          GlyphMap.addGlyph(itemGlyph);
        });

        // Load corpse glyphs
        corpseData.corpses.forEach((corpse: BaseGlyph) => {
          const corpseGlyph = new GlyphInfo(
            corpse.id,
            corpse.fgCol,
            corpse.bgCol,
            corpse.hasSolidBg,
            corpse.char,
            corpse.name,
            corpse.description,
            false, // isOpaque
            false, // isBlockingMovement
            false, // isBlockingProjectiles
            false, // isDiggable
            false, // isCausingSlow
            false, // isCausingBurn
            false, // isMagnetic
            false, // isCausingBleed
            false, // isGlowing
            false, // isCausingPoison
            false, // isCausingConfusion
            false, // isCausingBlind
            0, // defaultBuffDuration
            corpse.help, // Optional
          );
          GlyphMap.addGlyph(corpseGlyph);
        });

        resolve(GlyphMap.getRegistrySize());
      } catch (error) {
        reject(error);
      }
    });
  }
}
