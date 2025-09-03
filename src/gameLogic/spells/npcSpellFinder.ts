import { Buff } from '../buffs/buffEnum';
import { BuffCommand } from '../commands/buffCommand';
import { BulletCommand } from '../commands/bulletCommand';
import { CleanseAllCommand } from '../commands/cleanseAllCommand';
import { Command } from '../../shared-types/gameLogic/commands/command';
import { Cost } from '../../shared-types/gameLogic/commands/cost';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { HealCommand } from '../commands/healCommand';
import { Mob } from '../mobs/mob';
import { MultiplyCommand } from '../commands/multiplyCommand';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { Spell } from './spell';
import { Stack } from '../../shared-types/terminal/stack';
import { StackScreen } from '../../shared-types/terminal/stackScreen';
import { SummonCommand } from '../commands/summonCommand';
import { TeleportCommand } from '../commands/teleportCommand';

/**
 * Helper-class that provides methods for returning a spells to be used by npc-mobs.
 */
export class NPCSpellFinder {
  private readonly commandMap: Map<Spell, (me: Mob) => Command>;

  constructor(
    public game: GameState,
    public stack: Stack,
    public make: ScreenMaker,
    public player: Mob = game.player,
  ) {
    const g = this.game;
    const level = 1;

    this.commandMap = new Map<Spell, (me: Mob) => Command>([
      [Spell.Heal, (me: Mob) => new HealCommand(level, me, g)],
      [Spell.Charm, (me: Mob) => this.buff(Buff.Charm, me)],
      [Spell.Slow, (me: Mob) => this.buff(Buff.Slow, me)],
      [Spell.Afraid, (me: Mob) => this.buff(Buff.Afraid, me)],
      [
        Spell.Bullet,
        (me: Mob) => this.aim(new BulletCommand(me, g, this.stack, this.make)),
      ],
      [Spell.Poison, (me: Mob) => this.buff(Buff.Poison, me)],
      [Spell.Confuse, (me: Mob) => this.buff(Buff.Confuse, me)],
      [Spell.Silence, (me: Mob) => this.buff(Buff.Silence, me)],
      [Spell.Cleanse, (me: Mob) => new CleanseAllCommand(me, g)],
      [Spell.Stun, (me: Mob) => this.buff(Buff.Stun, me)],
      [Spell.Burn, (me: Mob) => this.buff(Buff.Burn, me)],
      [Spell.Blind, (me: Mob) => this.buff(Buff.Blind, me)],
      [Spell.Multiply, (me: Mob) => new MultiplyCommand(me, g)],
      [Spell.Freeze, (me: Mob) => this.buff(Buff.Freeze, me)],
      [Spell.Root, (me: Mob) => this.buff(Buff.Root, me)],
      [Spell.Shock, (me: Mob) => this.buff(Buff.Shock, me)],
      [Spell.Teleport, (me: Mob) => new TeleportCommand(6, me, g)],
      [Spell.Paralyze, (me: Mob) => this.buff(Buff.Paralyze, me)],
      [Spell.Sleep, (me: Mob) => this.buff(Buff.Sleep, me)],
      [Spell.Petrify, (me: Mob) => this.buff(Buff.Petrify, me)],
      [Spell.Summon, (me: Mob) => new SummonCommand(me, g)],
      [Spell.Bleed, (me: Mob) => this.buff(Buff.Bleed, me)],
      [Spell.Levitate, (me: Mob) => this.buff(Buff.Levitate, me)],
      [Spell.Disarm, (me: Mob) => this.buff(Buff.Disarm, me)],
    ]);
  }

  /**
   * Finds and returns a Command or StackScreen based on the provided spell and optional cost.
   *
   * @param me - The Mob object representing the player.
   * @param spell - The spell to be executed.
   * @param cost - The optional cost of the spell.
   * @return The found Command or StackScreen, or null if the spell is not recognized.
   */
  public find(
    me: Mob,
    spell: Spell,
    cost?: Cost,
  ): Command | StackScreen | null {
    const screen: StackScreen | null = null;
    const createCommand = this.commandMap.get(spell);

    if (!createCommand) return null;

    const cmd = createCommand(me);
    cmd.setCost(cost);

    return screen ? screen : cmd;
  }

  /**
   * Sets the direction of the command based on the player's position and returns the updated command.
   *
   * @param cmd - The command to be updated.
   * @return The updated command with the direction set.
   */
  private aim(cmd: BulletCommand): Command {
    const dir = cmd.me.pos.directionTo(this.player.pos);
    return cmd.setDirection(dir);
  }

  /**
   * Creates a new BuffCommand with the given buff and mob, and returns it as a Command.
   *
   * @param buff - The buff to be added to the mob.
   * @param me - The mob to receive the buff.
   * @return A new BuffCommand with the given buff and mob.
   */
  private buff(buff: Buff, me: Mob): Command {
    return new BuffCommand(buff, this.player, this.game, me);
  }
}
