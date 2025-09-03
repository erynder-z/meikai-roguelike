import { Buff } from '../buffs/buffEnum';
import { BuffCommand } from '../commands/buffCommand';
import { BulletCommand } from '../commands/bulletCommand';
import { CleanseAllCommand } from '../commands/cleanseAllCommand';
import { Command } from '../../shared-types/gameLogic/commands/command';
import { CommandDirectionScreen } from '../screens/commandDirectionScreen';
import { Cost } from '../../shared-types/gameLogic/commands/cost';
import { DrinkCommand } from '../commands/drinkCommand';
import { EatCommand } from '../commands/eatCommand';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { HealCommand } from '../commands/healCommand';
import { Mob } from '../mobs/mob';
import { MultiplyCommand } from '../commands/multiplyCommand';
import { PayloadCommand } from '../commands/payloadCommand';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { Spell } from './spell';
import { Stack } from '../../shared-types/terminal/stack';
import { StackScreen } from '../../shared-types/terminal/stackScreen';
import { SummonCommand } from '../commands/summonCommand';
import { TeleportCommand } from '../commands/teleportCommand';

type CommandOrScreen = {
  cmd: Command;
  screen?: StackScreen;
};

type SpellFactory = (amount: number, cost?: Cost) => CommandOrScreen;

/**
 * Helper-class that provides methods for returning a Command or a StackScreen for a spell.
 */
export class SpellFinder {
  private spellMap: Map<Spell, SpellFactory>;

  constructor(
    public game: GameState,
    public stack: Stack,
    public make: ScreenMaker,
  ) {
    const me = this.game.player;
    const level = this.game.dungeon.level;

    this.spellMap = new Map<Spell, SpellFactory>([
      [
        Spell.Heal,
        (amount, cost) => ({ cmd: new HealCommand(level, me, game) }),
      ],
      [Spell.Charm, (amount, cost) => this.buff(Buff.Charm, me)],
      [Spell.Slow, (amount, cost) => this.buff(Buff.Slow, me)],
      [Spell.Afraid, (amount, cost) => this.buff(Buff.Afraid, me)],
      [
        Spell.Bullet,
        (amount, cost) => {
          const cmd = new BulletCommand(me, game, this.stack, this.make);
          return { cmd, screen: this.dir(cmd) };
        },
      ],
      [Spell.Poison, (amount, cost) => this.buff(Buff.Poison, me)],
      [Spell.Confuse, (amount, cost) => this.buff(Buff.Confuse, me)],
      [Spell.Silence, (amount, cost) => this.buff(Buff.Silence, me)],
      [
        Spell.Cleanse,
        (amount, cost) => ({ cmd: new CleanseAllCommand(me, game) }),
      ],
      [Spell.Stun, (amount, cost) => this.buff(Buff.Stun, me)],
      [Spell.Burn, (amount, cost) => this.buff(Buff.Burn, me)],
      [Spell.Blind, (amount, cost) => this.buff(Buff.Blind, me)],
      [
        Spell.Multiply,
        (amount, cost) => ({ cmd: new MultiplyCommand(me, game) }),
      ],
      [Spell.Freeze, (amount, cost) => this.buff(Buff.Freeze, me)],
      [Spell.Root, (amount, cost) => this.buff(Buff.Root, me)],
      [Spell.Shock, (amount, cost) => this.buff(Buff.Shock, me)],
      [
        Spell.Teleport,
        (amount, cost) => ({ cmd: new TeleportCommand(6, me, game) }),
      ],
      [Spell.Paralyze, (amount, cost) => this.buff(Buff.Paralyze, me)],
      [Spell.Sleep, (amount, cost) => this.buff(Buff.Sleep, me)],
      [Spell.Petrify, (amount, cost) => this.buff(Buff.Petrify, me)],
      [Spell.Summon, (amount, cost) => ({ cmd: new SummonCommand(me, game) })],
      [Spell.Bleed, (amount, cost) => this.buff(Buff.Bleed, me)],
      [Spell.Levitate, (amount, cost) => this.buff(Buff.Levitate, me)],
      [Spell.Disarm, (amount, cost) => this.buff(Buff.Disarm, me)],
      [
        Spell.DecreaseHunger,
        (amount, cost) => ({ cmd: new EatCommand(me, game, amount) }),
      ],
      [
        Spell.DecreaseThirst,
        (amount, cost) => ({ cmd: new DrinkCommand(me, game, amount) }),
      ],
    ]);
  }

  /**
   * Finds and returns a Command or a StackScreen based on the provided spell and optional cost.
   *
   * @param spell - The spell to be executed.
   * @param amount - The amount of the spell to be executed.
   * @param cost - The optional cost of the spell.
   * @return The found Command or StackScreen, or null if the spell is not recognized.
   */
  public find(
    spell: Spell,
    amount: number,
    cost?: Cost,
  ): Command | StackScreen | null {
    const getCommandOrScreen = this.spellMap.get(spell);
    if (!getCommandOrScreen) return null;

    const { cmd, screen } = getCommandOrScreen(amount, cost);
    cmd.setCost(cost);
    return screen ?? cmd;
  }

  /**
   * Wraps a BuffCommand with a PayloadCommand.
   *
   * @param buff - The buff to be added to the mob.
   * @param me - The mob to receive the buff.
   * @return A new PayloadCommand with the given buff, mob, game, and mob as the payload.
   */
  private buff(buff: Buff, me: Mob): CommandOrScreen {
    const buffCmd = new BuffCommand(buff, me, this.game, me);
    return this.payload(buffCmd, me);
  }

  /**
   * Wraps a Command with a PayloadCommand and then wraps that with a direction screen.
   *
   * @param inner - The command to be wrapped.
   * @param me - The mob to be used as the payload.
   * @return A new PayloadCommand with the given command, mob, game, stack, screen maker, and mob as the payload, wrapped with a direction screen.
   */
  private payload(inner: Command, me: Mob): CommandOrScreen {
    const cmd: Command = new PayloadCommand(
      me,
      this.game,
      this.stack,
      this.make,
      inner,
    );
    const dirScreen: StackScreen = this.dir(cmd);
    return { cmd, screen: dirScreen };
  }

  /**
   * Creates a new CommandDirectionScreen with the given command, game, and screen maker.
   *
   * @param cmd - The command to be wrapped with the direction screen.
   * @return A new CommandDirectionScreen with the given command, game, and screen maker.
   */
  private dir(cmd: Command): StackScreen {
    return new CommandDirectionScreen(cmd, this.game, this.make);
  }
}
