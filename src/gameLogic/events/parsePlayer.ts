import { ControlSchemeManager } from '../../controls/controlSchemeManager';
import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { WorldPoint } from '../../maps/mapModel/worldPoint';
import { DrawUI } from '../../renderer/drawUI';
import { ControlSchemeName } from '../../shared-types/controls/controlScheme';
import { GameState } from '../../shared-types/gameBuilder/gameState';
import { Command } from '../../shared-types/gameLogic/commands/command';
import { GameMapType } from '../../shared-types/gameLogic/maps/mapModel/gameMapType';
import { ScreenMaker } from '../../shared-types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../shared-types/terminal/stack';
import { StackScreen } from '../../shared-types/terminal/stackScreen';
import { DigCommand } from '../commands/digCommand';
import { DoorCommand } from '../commands/doorCommand';
import { MoveBumpCommand } from '../commands/moveBumpCommand';
import { PickupCommand } from '../commands/pickupCommand';
import { WaitCommand } from '../commands/waitCommand';
import { Mob } from '../mobs/mob';
import { CommandDirectionScreen } from '../screens/commandDirectionScreen';
import { CraftingScreen } from '../screens/craftingScreen';
import { DebuggerScreen } from '../screens/debuggerScreen';
import { EquipmentScreen } from '../screens/equipmentScreen';
import { IngameMenuScreen } from '../screens/ingameMenuScreen';
import { InventoryScreen } from '../screens/inventoryScreen';
import { LogScreen } from '../screens/logScreen';
import { LookScreen } from '../screens/lookScreen';
import { SpellScreen } from '../screens/spellScreen';
import { StatsScreen } from '../screens/statsScreen';

/**
 * Class responsible for parsing player input and converting it into game commands.
 */
export class ParsePlayer {
  private readonly currentScheme: ControlSchemeName;
  private readonly controlSchemeManager: ControlSchemeManager;
  private readonly activeControlScheme: Record<string, string[]>;

  private readonly directionMap: Record<string, WorldPoint>;
  private readonly screenActions: Record<
    string,
    (stack: Stack) => StackScreen | undefined
  >;
  private readonly commandActions: Record<
    string,
    (stack: Stack) => Command | undefined
  >;

  constructor(
    public game: GameState,
    public make: ScreenMaker,
    public player: Mob = <Mob>game.player,
    public map: GameMapType = <GameMapType>game.currentMap(),
  ) {
    this.currentScheme =
      gameConfigManager.getConfig().control_scheme || 'default';
    this.controlSchemeManager = new ControlSchemeManager(this.currentScheme);
    this.activeControlScheme = this.controlSchemeManager.getActiveScheme();
    const acs = this.activeControlScheme; // shorthand

    this.directionMap = {
      [acs.move_left.toString()]: new WorldPoint(-1, 0),
      [acs.move_right.toString()]: new WorldPoint(1, 0),
      [acs.move_up.toString()]: new WorldPoint(0, -1),
      [acs.move_down.toString()]: new WorldPoint(0, 1),
      [acs.move_up_left.toString()]: new WorldPoint(-1, -1),
      [acs.move_up_right.toString()]: new WorldPoint(1, -1),
      [acs.move_down_left.toString()]: new WorldPoint(-1, 1),
      [acs.move_down_right.toString()]: new WorldPoint(1, 1),
    };

    this.commandActions = {
      [acs.wait.toString()]: stack => this.waitCmd(stack),
      [acs.grab_item.toString()]: () =>
        this.game.inventory ? new PickupCommand(this.game) : undefined,
    };

    this.screenActions = {
      [acs.log.toString()]: () => new LogScreen(this.game, this.make),
      [acs.handle_door.toString()]: () => this.doorCommand(),
      [acs.inventory.toString()]: () =>
        this.game.inventory
          ? new InventoryScreen(this.game, this.make)
          : undefined,
      [acs.equipment.toString()]: () =>
        this.game.equipment
          ? new EquipmentScreen(this.game, this.make)
          : undefined,
      [acs.look.toString()]: () => new LookScreen(this.game, this.make),
      [acs.spells.toString()]: () => new SpellScreen(this.game, this.make),
      [acs.stats.toString()]: () => new StatsScreen(this.game, this.make),
      [acs.craft.toString()]: () => new CraftingScreen(this.game, this.make),
      [acs.menu.toString()]: stack =>
        new IngameMenuScreen(this.game, this.make, stack),
      [acs.debug1.toString()]: () => new DebuggerScreen(this.game, this.make),
    };
  }

  /**
   * Parses the given key code as a turn and executes the corresponding command.
   *
   * @param char - the character representing the key code.
   * @param stack - the stack to manipulate.
   * @param event - the keyboard event associated with the key press, or null.
   * @return true if the command was successfully executed, false otherwise.
   */
  public parseKeyCodeAsTurn(
    char: string,
    stack: Stack,
    event: KeyboardEvent | null,
  ): boolean {
    const cmd = this.parseKeyCommand(char, stack, event);
    return cmd ? cmd.turn() : false;
  }

  /**
   * Parses the key command and returns the corresponding command, or null if no command is found.
   *
   * @param char - the character representing the key command.
   * @param stack - the stack object.
   * @param event - the keyboard event, or null if not available.
   * @return the corresponding command, or null if no command is found.
   */
  private parseKeyCommand(
    char: string,
    stack: Stack,
    event: KeyboardEvent | null,
  ): Command | null {
    const alt = event?.altKey || event?.metaKey;
    if (event && alt) event.preventDefault();

    // Direct commands
    const commandAction = this.commandActions[char];
    if (commandAction) {
      return commandAction(stack) ?? null;
    }

    // Screen-pushing actions
    const screenAction = this.screenActions[char];
    if (screenAction) {
      const stackScreen = screenAction(stack);
      if (stackScreen) {
        DrawUI.clearFlash(this.game);
        stack.push(stackScreen);
      }
      return null;
    }

    // Movement-based actions
    const direction = this.directionMap[char];
    if (direction) {
      return alt
        ? this.digInDirection(direction, stack)
        : this.moveBumpCmd(direction, stack);
    }

    // Debug keys or other keys
    if (char === this.activeControlScheme.debug1.toString()) {
      console.log('stack: ', stack);
      console.log('game: ', this.game);
    }
    if (char === this.activeControlScheme.debug2.toString()) {
      // Placeholder for debugging
    }

    return null;
  }

  /**
   * Creates a new DigCommand with the given direction and player/game objects,
   *
   * @param dir - The direction in which to dig.
   * @return A new DigCommand object.
   */
  private digInDirection(dir: WorldPoint, stack: Stack): Command {
    return new DigCommand(dir, this.player, this.game, stack, this.make);
  }

  /**
   * Creates a new WaitCommand with the given stack, player, and game.
   *
   * @param stack - The stack object used by the WaitCommand.
   * @return The newly created WaitCommand.
   */
  private waitCmd(stack: Stack): Command {
    return new WaitCommand(this.player, this.game, stack, this.make);
  }

  /**
   * Creates a new MoveBumpCommand with the specified direction, player, game, stack, and screen maker.
   *
   * @param dir - The direction in which the player intends to move or bump.
   * @param stack - The stack object used by the MoveBumpCommand.
   * @return The newly created MoveBumpCommand.
   */
  private moveBumpCmd(dir: WorldPoint, stack: Stack): Command {
    return new MoveBumpCommand(dir, this.player, this.game, stack, this.make);
  }

  /**
   * Creates a new DoorCommand with the current player and game, and wraps it in a new
   * CommandDirectionScreen for the user to select a direction.
   *
   * @return The newly created CommandDirectionScreen.
   */
  private doorCommand(): StackScreen {
    const command = new DoorCommand(this.player, this.game);
    return new CommandDirectionScreen(command, this.game, this.make);
  }

  /**
   * Executes a bullet command by creating a new BulletCommand instance with the provided stack,
   * and passing it to the direction method. The direction method returns a StackScreen.
   *
   * @param stack - The stack object used by the BulletCommand.
   * @return The StackScreen returned by the direction method.
   */
  /* private bulletCommand(stack: Stack): StackScreen {
    return this.direction(
      new BulletCommand(this.player, this.game, stack, this.make),
    );
  } */

  /**
   * Creates a new CommandDirectionScreen with the given command and returns it as a StackScreen.
   *
   * @param command - The command to be executed.
   * @return The newly created CommandDirectionScreen.
   */
  /* private direction(command: Command): StackScreen {
    return new CommandDirectionScreen(command, this.game, this.make);
  } */
}
