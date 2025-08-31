import { CanSee } from '../../maps/helpers/canSee';
import { CommandBase } from '../commands/commandBase';
import { Cost } from '../../shared-types/gameLogic/commands/cost';
import { GameMap } from '../../maps/mapModel/gameMap';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Mob } from './mob';
import { MobAI } from '../../shared-types/gameLogic/mobs/mobAI';
import { MobAI2_Cat } from './mobAI2_Cat';
import { MobAI3_Ant } from './mobAI3_Ant';
import { Mood } from './moodEnum';
import { NPCSpellFinder } from '../spells/npcSpellFinder';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { SimpleSleepAI } from './simpleSleepAI';
import { PICKABLE_SPELLS, Spell } from '../spells/spell';
import { Stack } from '../../shared-types/terminal/stack';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * An AI implementation for Mobs that shoot spells. Spells are being shot in diagonal or orthogonal lines.
 *
 */
export class ShootAI implements MobAI {
  private aiDir: MobAI = new MobAI2_Cat();
  private aiRnd: MobAI = new MobAI3_Ant();
  constructor(
    public speed: number,
    public spellRate: number,
  ) {}

  /**
   * Takes a turn for the Mob in a shootAI state.
   *
   * @param me - The Mob making the turn.
   * @param enemy - The enemy Mob.
   * @param game - The game instance.
   * @param stack - The screen stack.
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
    const { rand } = game;
    const far = !SimpleSleepAI.isNear(me, enemy);

    if (far) {
      me.mood = rand.isOneIn(3) ? Mood.Asleep : Mood.Awake;
      if (me.mood == Mood.Asleep) return true;
    }

    if (this.didShoot(me, rand, game, enemy, stack, make)) return true;

    if (this.maybeCastSpell(me, enemy, game, stack, make)) return true;

    for (let i = 0; i < this.speed; ++i) {
      const ai = rand.isOneIn(2) ? this.aiDir : this.aiRnd;
      ai.turn(me, enemy, game, stack, make);
    }

    return true;
  }

  /**
   * Tries to cast a spell between two mobs in the game.
   *
   * @param me - the casting mob.
   * @param enemy - the target mob.
   * @param game - the game instance.
   * @param stack - the game stack.
   * @param make - the screen maker.
   * @return True if the spell was cast, false otherwise.
   */
  private maybeCastSpell(
    me: Mob,
    enemy: Mob,
    game: GameState,
    stack: Stack,
    make: ScreenMaker,
  ): boolean {
    const map = <GameMap>game.currentMap();

    if (!CanSee.checkMobLOS_Bresenham(me, enemy, map, true)) return false;

    const { rand } = game;

    if (!rand.isOneIn(this.spellRate)) return false;

    const spell = this.pickSpell(me, rand);

    return this.castSpell(spell, me, enemy, game, stack, make);
  }

  /**
   * Picks a spell for the given mob based on its level.
   *
   * @param me - The mob for which to pick the spell.
   * @param rand - The random generator used for picking the spell.
   * @return The spell chosen for the mob.
   */
  private pickSpell(me: Mob, rand: RandomGenerator): Spell {
    const index = me.level % PICKABLE_SPELLS.length;
    const spell = PICKABLE_SPELLS[index];

    console.log(`${me.name}: spell ${Spell[spell]}`);
    return spell;
  }

  /**
   * Casts a spell using the NPCSpellFinder and executes the command if it is an instance of CommandBase.
   *
   * @param spell - The spell to be cast.
   * @param me - The mob casting the spell.
   * @param enemy - The mob being targeted by the spell.
   * @param game - The game object.
   * @param stack - The game stack.
   * @param make - The screen maker.
   * @return Returns true if the spell was successfully cast and executed, otherwise false.
   */
  private castSpell(
    spell: Spell,
    me: Mob,
    enemy: Mob,
    game: GameState,
    stack: Stack,
    make: ScreenMaker,
  ): boolean {
    const finder = new NPCSpellFinder(game, stack, make);
    const noCost: Cost | undefined = undefined;
    const commandOrSpell = finder.find(me, spell, noCost);

    if (commandOrSpell instanceof CommandBase) return commandOrSpell.npcTurn();

    return true;
  }

  /**
   * Checks if the mob can shoot at another mob, picks a spell, checks if the spell is a bullet spell,
   * checks if the spell rate is met, checks if the mob is in line of sight of the target, and shoots.
   *
   * @param me - The mob that is shooting.
   * @param rand - The random generator used for picking a spell.
   * @param game - The game object used for getting the current map and checking line of sight.
   * @param him - The mob that is being shot at.
   * @param stack - The game stack used for shooting.
   * @param make - The screen maker used for shooting.
   * @return Returns true if the mob successfully shoots, false otherwise.
   */
  private didShoot(
    me: Mob,
    rand: RandomGenerator,
    game: GameState,
    him: Mob,
    stack: Stack,
    make: ScreenMaker,
  ): boolean {
    if (!this.aim(me.pos, him.pos)) return false;

    const spell = this.pickSpell(me, rand);
    if (!this.isBulletSpell(spell)) return false;
    if (!rand.isOneIn(this.spellRate)) return false;

    const map = <GameMap>game.currentMap();
    if (!CanSee.checkMobLOS_Bresenham(me, him, map, true)) return false;

    return this.shoot(spell, me, him, game, stack, make);
  }

  /**
   * Checks if the given direction is a diagonal line between two points.
   *
   * @param from - The starting point.
   * @param to - The ending point.
   * @return Returns true if the direction is diagonal, false otherwise.
   */
  private aim(from: WorldPoint, to: WorldPoint): boolean {
    const delta = from.minus(to);
    if (delta.x == 0 || delta.y == 0) return true;

    const xAxis = Math.abs(delta.x);
    const yAxis = Math.abs(delta.y);

    return xAxis == yAxis;
  }

  /**
   * Checks if the given spell is a bullet spell.
   *
   * @param spell - The spell to check.
   * @return True if the spell is a bullet spell, false otherwise.
   */
  private isBulletSpell(spell: Spell): boolean {
    return spell == Spell.Bullet;
  }

  /**
   * Shoots a spell from the given mob to another mob.
   *
   * @param spell - The spell to be shot.
   * @param me - The mob shooting the spell.
   * @param him - The mob being shot.
   * @param game - The game object.
   * @param stack - The game stack.
   * @param make - The screen maker.
   * @return Returns true if the spell was successfully shot.
   */
  private shoot(
    spell: Spell,
    me: Mob,
    him: Mob,
    game: GameState,
    stack: Stack,
    make: ScreenMaker,
  ): boolean {
    this.castSpell(spell, me, him, game, stack, make);
    return true;
  }
}
