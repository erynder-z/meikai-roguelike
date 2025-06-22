import { Buff } from '../buffs/buffEnum';
import { BuffCommand } from '../commands/buffCommand';
import { BulletCommand } from '../commands/bulletCommand';
import { CleanseAllCommand } from '../commands/cleanseAllCommand';
import { Command } from '../../types/gameLogic/commands/command';
import { CommandDirectionScreen } from '../screens/commandDirectionScreen';
import { CommandOrScreen } from '../../types/gameLogic/screens/CommandOrScreen';
import { Cost } from '../../types/gameLogic/commands/cost';
import { DrinkCommand } from '../commands/drinkCommand';
import { EatCommand } from '../commands/eatCommand';
import { GameState } from '../../types/gameBuilder/gameState';
import { HealCommand } from '../commands/healCommand';
import { Mob } from '../mobs/mob';
import { MultiplyCommand } from '../commands/multiplyCommand';
import { PayloadCommand } from '../commands/payloadCommand';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Spell } from './spell';
import { Stack } from '../../types/terminal/stack';
import { StackScreen } from '../../types/terminal/stackScreen';
import { SummonCommand } from '../commands/summonCommand';
import { TeleportCommand } from '../commands/teleportCommand';

/**
 * Helper-class that provides methods for returning a Command or a StackScreen for a spell.
 */
export class SpellFinder {
  constructor(
    public game: GameState,
    public stack: Stack,
    public make: ScreenMaker,
  ) {}
  /**
   * Finds and returns a Command or StackScreen based on the provided spell and optional cost.
   *
   * @param spell - The spell to be executed.
   * @param amount - The amount of the spell.
   * @param cost - The optional cost of the spell.
   * @return The found Command or StackScreen, or null if the spell is not recognized.
   */
  public find(
    spell: Spell,
    amount: number,
    cost?: Cost,
  ): Command | StackScreen | null {
    const { game } = this;

    const me = game.player;
    const level = this.game.dungeon.level;

    let screen: StackScreen | null = null;
    let cmd: Command;

    const b = this.buff.bind(this);
    switch (spell) {
      case Spell.Heal:
        cmd = new HealCommand(level, me, game);
        break;
      case Spell.Charm:
        ({ screen, cmd } = b(Buff.Charm, me));
        break;
      case Spell.Slow:
        ({ screen, cmd } = b(Buff.Slow, me));
        break;
      case Spell.Afraid:
        ({ screen, cmd } = b(Buff.Afraid, me));
        break;
      case Spell.Bullet:
        screen = this.dir(
          (cmd = new BulletCommand(game.player, game, this.stack, this.make)), // TODO: add damage amount based on item properties
        );
        break;
      case Spell.Poison:
        ({ screen, cmd } = b(Buff.Poison, me));
        break;
      case Spell.Confuse:
        ({ screen, cmd } = b(Buff.Confuse, me));
        break;
      case Spell.Silence:
        ({ screen, cmd } = b(Buff.Silence, me));
        break;
      case Spell.Cleanse:
        cmd = new CleanseAllCommand(me, game);
        break;
      case Spell.Stun:
        ({ screen, cmd } = b(Buff.Stun, me));
        break;
      case Spell.Burn:
        ({ screen, cmd } = b(Buff.Burn, me));
        break;
      case Spell.Blind:
        ({ screen, cmd } = b(Buff.Blind, me));
        break;
      case Spell.Multiply:
        cmd = new MultiplyCommand(me, game);
        break;
      case Spell.Freeze:
        ({ screen, cmd } = b(Buff.Freeze, me));
        break;
      case Spell.Root:
        ({ screen, cmd } = b(Buff.Root, me));
        break;
      case Spell.Shock:
        ({ screen, cmd } = b(Buff.Shock, me));
        break;
      case Spell.Teleport:
        cmd = new TeleportCommand(6, me, game);
        break;
      case Spell.Paralyze:
        ({ screen, cmd } = b(Buff.Paralyze, me));
        break;
      case Spell.Sleep:
        ({ screen, cmd } = b(Buff.Sleep, me));
        break;
      case Spell.Petrify:
        ({ screen, cmd } = b(Buff.Petrify, me));
        break;
      case Spell.Summon:
        cmd = new SummonCommand(me, game);
        break;
      case Spell.Bleed:
        ({ screen, cmd } = b(Buff.Bleed, me));
        break;
      case Spell.Levitate:
        ({ screen, cmd } = b(Buff.Levitate, me));
        break;
      case Spell.Disarm:
        ({ screen, cmd } = b(Buff.Disarm, me));
        break;
      case Spell.DecreaseHunger:
        cmd = new EatCommand(me, game, amount);
        break;
      case Spell.DecreaseThirst:
        cmd = new DrinkCommand(me, game, amount);
        break;

      default:
        return null;
    }
    cmd.setCost(cost);
    return screen ? screen : cmd;
  }

  /**
   * Creates a new buff command and returns a CommandOrScreen object containing the command and screen.
   *
   * @param buff - The type of buff to add.
   * @param me - The mob to add the buff to.
   * @return An object containing the command and screen.
   */
  private buff(buff: Buff, me: Mob): CommandOrScreen {
    const buffCmd = new BuffCommand(buff, me, this.game, me);
    const { screen, cmd } = this.payload(buffCmd, me);
    return { cmd: cmd, screen: screen };
  }

  /**
   * Creates a new payload command and returns a CommandOrScreen object containing the command and screen.
   *
   * @param inner - The inner command to be wrapped by the payload command.
   * @param me - The mob that will execute the command.
   * @return An object containing the command and screen.
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
    return { cmd: cmd, screen: dirScreen };
  }

  /**
   * Creates a new CommandDirectionScreen with the given command and returns it as a StackScreen.
   *
   * @param cmd - The command to be executed.
   * @return The newly created CommandDirectionScreen.
   */
  private dir(cmd: Command): StackScreen {
    return new CommandDirectionScreen(cmd, this.game, this.make);
  }
}
