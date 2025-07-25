import { AwakeAI } from './awakeAI';
import { GameState } from '../../types/gameBuilder/gameState';
import { Mob } from './mob';
import { MobAI } from '../../types/gameLogic/mobs/mobAI';
import { Mood } from './moodEnum';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { ShootAI } from './shootAI';
import { SimpleSleepAI } from './simpleSleepAI';
import { SpellAI } from './spellAI';
import { Stack } from '../../types/terminal/stack';
import { VisibilityAwareSleepAI } from './visibilityAwareSleepAI';

/**
 * An AI implementation that delegates behavior based on a Mob's mood.
 *
 */
export class MoodAI implements MobAI {
  constructor(
    public asleep: MobAI,
    public awake: MobAI,
  ) {}

  /**
   * Delegates the turn action to the appropriate AI based on the Mob's mood.
   *
   * @param me - The Mob making the turn.
   * @param enemy - The enemy Mob.
   * @param game - The game instance.
   * @param stack - The screen stack.
   * @param make - The screen maker.
   * @returns The result of the delegated turn action.
   */
  public turn(
    me: Mob,
    enemy: Mob,
    game: GameState,
    stack: Stack,
    make: ScreenMaker,
  ): boolean {
    let ai: MobAI;
    switch (me.mood) {
      case Mood.Asleep:
        ai = this.asleep;
        break;
      case Mood.Awake:
        ai = this.awake;
        break;
      default:
        ai = this.asleep;
        break;
    }
    return ai!.turn(me, enemy, game, stack, make);
  }

  /**
   * Creates a default MoodAI instance with a SimpleSleepAI for asleep and AwakeAI for awake.
   *
   * @return A new MoodAI instance with default AIs.
   */
  public static stockMood(speed: number): MobAI {
    return new MoodAI(new VisibilityAwareSleepAI(), new AwakeAI(speed));
  }

  /**
   * Creates a default MoodAI instance with a SimpleSleepAI for asleep and SpellAI for awake.
   *
   * @param speed - The speed of the mob.
   * @param spellRate - The rate at which the mob casts spells.
   * @return A new MoodAI instance with default AIs.
   */
  public static stockMoodSpellCaster(speed: number, spellRate: number): MobAI {
    return new MoodAI(new SimpleSleepAI(), new SpellAI(speed, spellRate));
  }

  /**
   * Creates a MoodAI instance with a SimpleSleepAI for asleep and ShootAI for awake.
   *
   * @param speed - The speed of the mob.
   * @param spellRate - The rate at which the mob shoots spells.
   * @return A new MoodAI instance with default AIs.
   */

  public static stockMoodShootAI(speed: number, spellRate: number): MobAI {
    return new MoodAI(new SimpleSleepAI(), new ShootAI(speed, spellRate));
  }
}
