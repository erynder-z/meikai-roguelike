import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Command } from '../../shared-types/gameLogic/commands/command';
import { Cost } from '../../shared-types/gameLogic/commands/cost';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../shared-types/terminal/stack';
import { StackScreen } from '../../shared-types/terminal/stackScreen';
import { Buff } from '../buffs/buffEnum';
import { BuffCommand } from '../commands/buffCommand';
import { BulletCommand } from '../commands/bulletCommand';
import { CleanseAllCommand } from '../commands/cleanseAllCommand';
import { DrinkCommand } from '../commands/drinkCommand';
import { EatCommand } from '../commands/eatCommand';
import { HealCommand } from '../commands/healCommand';
import { MultiplyCommand } from '../commands/multiplyCommand';
import { PayloadCommand } from '../commands/payloadCommand';
import { SummonCommand } from '../commands/summonCommand';
import { TeleportCommand } from '../commands/teleportCommand';
import { Mob } from '../mobs/mob';
import { CommandDirectionScreen } from '../screens/commandDirectionScreen';
import { Spell } from './spell';

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
        (_amount, _cost) => ({ cmd: new HealCommand(level, me, game) }),
      ],
      [Spell.Charm, (_amount, _cost) => this.buff(Buff.Charm, me)],
      [Spell.Slow, (_amount, _cost) => this.buff(Buff.Slow, me)],
      [Spell.Afraid, (_amount, _cost) => this.buff(Buff.Afraid, me)],
      [
        Spell.Bullet,
        (_amount, _cost) => {
          const cmd = new BulletCommand(me, game, this.stack, this.make);
          return { cmd, screen: this.dir(cmd) };
        },
      ],
      [Spell.Poison, (_amount, _cost) => this.buff(Buff.Poison, me)],
      [Spell.Confuse, (_amount, _cost) => this.buff(Buff.Confuse, me)],
      [Spell.Silence, (_amount, _cost) => this.buff(Buff.Silence, me)],
      [
        Spell.Cleanse,
        (_amount, _cost) => ({ cmd: new CleanseAllCommand(me, game) }),
      ],
      [Spell.Stun, (_amount, _cost) => this.buff(Buff.Stun, me)],
      [Spell.Burn, (_amount, _cost) => this.buff(Buff.Burn, me)],
      [Spell.Blind, (_amount, _cost) => this.buff(Buff.Blind, me)],
      [
        Spell.Multiply,
        (_amount, _cost) => ({ cmd: new MultiplyCommand(me, game) }),
      ],
      [Spell.Freeze, (_amount, _cost) => this.buff(Buff.Freeze, me)],
      [Spell.Root, (_amount, _cost) => this.buff(Buff.Root, me)],
      [Spell.Shock, (_amount, _cost) => this.buff(Buff.Shock, me)],
      [
        Spell.Teleport,
        (_amount, _cost) => ({ cmd: new TeleportCommand(6, me, game) }),
      ],
      [Spell.Paralyze, (_amount, _cost) => this.buff(Buff.Paralyze, me)],
      [Spell.Sleep, (_amount, _cost) => this.buff(Buff.Sleep, me)],
      [Spell.Petrify, (_amount, _cost) => this.buff(Buff.Petrify, me)],
      [
        Spell.Summon,
        (_amount, _cost) => ({ cmd: new SummonCommand(me, game) }),
      ],
      [Spell.Bleed, (_amount, _cost) => this.buff(Buff.Bleed, me)],
      [Spell.Levitate, (_amount, _cost) => this.buff(Buff.Levitate, me)],
      [Spell.Disarm, (_amount, _cost) => this.buff(Buff.Disarm, me)],
      [
        Spell.DecreaseHunger,
        (amount, _cost) => ({ cmd: new EatCommand(me, game, amount) }),
      ],
      [
        Spell.DecreaseThirst,
        (amount, _cost) => ({ cmd: new DrinkCommand(me, game, amount) }),
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
