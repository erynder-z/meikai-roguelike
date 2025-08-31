import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Glyph } from '../glyphs/glyph';
import { Mob } from './mob';
import { MobAI } from '../../shared-types/gameLogic/mobs/mobAI';
import { MobAI2_Cat } from './mobAI2_Cat';
import { MobAI3_Ant } from './mobAI3_Ant';
import { MobAI5_Druid } from './mobAI5_Druid';
import { MoodAI } from './moodAI';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../shared-types/terminal/stack';

/**
 * Represents an AI switcher that selects the appropriate AI implementation based on the type of mob.
 */
export class AISwitcher implements MobAI {
  private ai2_cat: MobAI = new MobAI2_Cat();
  private ai3_ant: MobAI = new MobAI3_Ant();
  private ai4_bat: MobAI = MoodAI.stockMood(2);
  private ai5_druid: MobAI = new MobAI5_Druid(1, 5);
  private ai_spell: MobAI = MoodAI.stockMoodSpellCaster(1, 8);
  private ai_shooter = MoodAI.stockMoodShootAI(1, 5);
  private ai_default: MobAI = MoodAI.stockMood(1);
  constructor(public ai1_std: MobAI) {}

  /**
   * Executes a turn for the mob using the appropriate AI based on the mob's type.
   *
   * @param me - The current mob controlled by this AI.
   * @param enemy - The enemy mob.
   * @param game - The game object.
   * @param game - The screen stack.
   * @param make - The screen maker.
   * @return True if the turn was successfully executed, false otherwise.
   */
  public turn(
    me: Mob,
    enemy: Mob,
    game: GameState,
    stack: Stack,
    make: ScreenMaker,
  ): boolean {
    let ai: MobAI;
    switch (me.glyph) {
      case Glyph.Ant:
        ai = this.ai3_ant;
        break;
      case Glyph.Bat:
        ai = this.ai4_bat;

        break;
      case Glyph.Cat:
        ai = this.ai2_cat;

        break;
      case Glyph.Druid:
        ai = this.ai5_druid;
        /*      ai = this.ai_shooter; */
        break;
      default:
        ai = this.ai1_std;
        break;
    }
    return ai.turn(me, enemy, game, stack, make);
  }
}
