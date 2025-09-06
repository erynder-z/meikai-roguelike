import { Buff } from '../buffs/buffEnum';
import { BuffCommand } from '../commands/buffCommand';
import { CanSee } from '../../maps/helpers/canSee';
import { GameMap } from '../../maps/mapModel/gameMap';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Mob } from './mob';
import { MobAI } from '../../shared-types/gameLogic/mobs/mobAI';
import { MobAI2_Cat } from './mobAI2_Cat';
import { MobAI3_Ant } from './mobAI3_Ant';
import { Mood } from './moodEnum';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { SimpleSleepAI } from './simpleSleepAI';
import { Stack } from '../../shared-types/terminal/stack';

/**
 * Represents an implementation of MobAI for a druid-type mob.
 * A test spellcaster
 */
export class MobAI5_Druid implements MobAI {
  private aiTargetedMovement: MobAI = new MobAI2_Cat();
  private aiRandomMovement: MobAI = new MobAI3_Ant();

  constructor(
    public speed: number,
    public spellRate: number,
  ) {}

  /**
   * Takes a turn for the Mob in an awake state.
   *
   * @param me - The Mob making the turn.
   * @param enemy - The enemy Mob.
   * @param game - The game instance.
   * @return - Always `true`.
   */
  public turn(
    me: Mob,
    enemy: Mob,
    game: GameState,
    stack: Stack,
    make: ScreenMaker,
  ): boolean {
    if (this.maybeCastSpell(me, enemy, game)) return true;
    const { rand } = game;
    for (let i = 0; i < this.speed; ++i) {
      const ai = rand.isOneIn(2)
        ? this.aiTargetedMovement
        : this.aiRandomMovement;
      ai.turn(me, enemy, game, stack, make);
    }
    const far = !SimpleSleepAI.isNear(me, enemy);
    if (far) me.mood = rand.isOneIn(3) ? Mood.Asleep : Mood.Awake;
    return true;
  }

  /**
   * A function to potentially cast a spell between two mobs in the game.
   *
   * @param me - the casting mob.
   * @param enemy - the target mob.
   * @param game - the game instance.
   * @return True if the spell was cast, false otherwise.
   */
  private maybeCastSpell(me: Mob, enemy: Mob, game: GameState): boolean {
    const map = <GameMap>game.currentMap();
    if (!CanSee.checkMobLOS_Bresenham(me, enemy, map, true)) return false;

    const r = game.rand;
    if (!r.isOneIn(this.spellRate)) return false;
    const buff = this.pickBuff(me, r);

    return this.cast(buff, me, enemy, game);
  }

  /**
   * A function that picks a buff for a given mob.
   *
   * @param me - the mob for which to pick the buff.
   * @param r - the random number generator.
   * @return The chosen buff for the mob.
   */
  private pickBuff(me: Mob, r: RandomGenerator): Buff {
    // TODO: Implement buff choosing
    return Buff.Bleed;
  }

  /**
   * Casts a spell on the enemy mob using the given buff, current mob, enemy mob, and game interface.
   *
   * @param buff - the buff to cast.
   * @param me - the current mob.
   * @param enemy - the enemy mob.
   * @param game - the game instance.
   * @return The result of the spell cast.
   */
  private cast(buff: number, me: Mob, enemy: Mob, game: GameState): boolean {
    const buffTime = 5;
    const spell = new BuffCommand(buff, enemy, game, me, buffTime);
    return spell.npcTurn();
  }
}
