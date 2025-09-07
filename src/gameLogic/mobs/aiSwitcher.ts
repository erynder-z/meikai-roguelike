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
  private readonly aiMap: Map<Glyph, MobAI>;

  constructor(public ai1_std: MobAI) {
    this.aiMap = new Map<Glyph, MobAI>([
      [Glyph.Ant, new MobAI3_Ant()],
      [Glyph.Bat, MoodAI.stockMood(2)],
      [Glyph.Cat, new MobAI2_Cat()],
      [Glyph.Druid, new MobAI5_Druid(1, 5)],
    ]);
  }

  /**
   * Executes a turn for the mob using the appropriate AI based on the mob's type.
   *
   * @param me - The current mob controlled by this AI.
   * @param enemy - The enemy mob.
   * @param game - The game object.
   * @param stack - The screen stack.
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
    const ai = this.aiMap.get(me.glyph) || this.ai1_std;
    return ai.turn(me, enemy, game, stack, make);
  }
}
