import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Mob } from './mob';
import { MobAI } from '../../shared-types/gameLogic/mobs/mobAI';
import { MobAI2_Cat } from './mobAI2_Cat';
import { MobAI3_Ant } from './mobAI3_Ant';
import { Mood } from './moodEnum';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { SimpleSleepAI } from './simpleSleepAI';
import { Stack } from '../../shared-types/terminal/stack';

/**
 * An AI implementation for Mobs in an awake state.
 *
 */
export class AwakeAI implements MobAI {
  private aiTargetedMovement: MobAI = new MobAI2_Cat();
  private aiRandomMovement: MobAI = new MobAI3_Ant();
  constructor(public speed: number) {}

  /**
   * Takes a turn for the Mob in an awake state.
   *
   *
   * @param me - The Mob making the turn.
   * @param enemy - The enemy Mob.
   * @param game - The game instance.
   * @param game - The screen stack.
   * @param make - The screen maker.
   * @return Always returns true.
   */
  public turn(
    me: Mob,
    enemy: Mob,
    game: GameState,
    stack: Stack,
    make: ScreenMaker,
  ): boolean {
    const r = game.rand;
    for (let i = 0; i < this.speed; ++i) {
      const ai = r.isOneIn(2) ? this.aiTargetedMovement : this.aiRandomMovement;
      ai.turn(me, enemy, game, stack, make);
    }
    const far = !SimpleSleepAI.isNear(me, enemy);
    if (far) me.mood = r.isOneIn(3) ? Mood.Asleep : Mood.Awake;
    return true;
  }
}
