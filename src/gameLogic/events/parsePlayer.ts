import { BulletCommand } from '../commands/bulletCommand';
import { Command } from '../../types/gameLogic/commands/command';
import { CommandDirectionScreen } from '../screens/commandDirectionScreen';
import { ControlSchemeManager } from '../../controls/controlSchemeManager';
import { DrawUI } from '../../renderer/drawUI';
import { DebuggerScreen } from '../screens/debuggerScreen';
import { DigCommand } from '../commands/digCommand';
import { DoorCommand } from '../commands/doorCommand';
import { EquipmentScreen } from '../screens/equipmentScreen';
import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { GameMapType } from '../../types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../../types/gameBuilder/gameState';
import { IngameMenuScreen } from '../screens/ingameMenuScreen';
import { InventoryScreen } from '../screens/inventoryScreen';
import { LogScreen } from '../screens/logScreen';
import { LookScreen } from '../screens/lookScreen';
import { Mob } from '../mobs/mob';
import { MoveBumpCommand } from '../commands/moveBumpCommand';
import { MoveCommand } from '../commands/moveCommand';
import { PickupCommand } from '../commands/pickupCommand';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { SpellScreen } from '../screens/spellScreen';
import { Stack } from '../../types/terminal/stack';
import { StackScreen } from '../../types/terminal/stackScreen';
import { StatsScreen } from '../screens/statsScreen';
import { WaitCommand } from '../commands/waitCommand';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Class responsible for parsing player input and converting it into game commands.
 */
export class ParsePlayer {
  private gameConfig = gameConfigManager.getConfig();
  private currentScheme = this.gameConfig.control_scheme || 'default';
  private controlSchemeManager: ControlSchemeManager;
  constructor(
    public game: GameState,
    public make: ScreenMaker,
    public player: Mob = <Mob>game.player,
    public map: GameMapType = <GameMapType>game.currentMap(),
  ) {
    this.currentScheme =
      gameConfigManager.getConfig().control_scheme || 'default';
    this.controlSchemeManager = new ControlSchemeManager(this.currentScheme);
  }

  /**
   * Parses the given key code as a turn and executes the corresponding command.
   *
   * @param {string} char - the character representing the key code
   * @param {Stack} stack - the stack to manipulate
   * @param {KeyboardEvent | null} event - the keyboard event associated with the key press, or null
   * @return {boolean} true if the command was successfully executed, false otherwise
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
   * @param {string} char - the character representing the key command
   * @param {Stack} stack - the stack object
   * @param {KeyboardEvent | null} event - the keyboard event, or null if not available
   * @return {Command | null} the corresponding command, or null if no command is found
   */
  private parseKeyCommand(
    char: string,
    stack: Stack,
    event: KeyboardEvent | null,
  ): Command | null {
    const activeControlScheme = this.controlSchemeManager.getActiveScheme();

    const alt = event?.altKey || event?.metaKey;
    let stackScreen: StackScreen | undefined;
    const dir = new WorldPoint();

    if (event && alt) event.preventDefault();

    switch (char) {
      case activeControlScheme.move_left.toString():
        dir.x = -1;
        break;
      case activeControlScheme.move_right.toString():
        dir.x = 1;
        break;
      case activeControlScheme.move_up.toString():
        dir.y = -1;
        break;
      case activeControlScheme.move_down.toString():
        dir.y = 1;
        break;
      case activeControlScheme.move_up_left.toString():
        dir.y = -1;
        dir.x = -1;
        break;
      case activeControlScheme.move_up_right.toString():
        dir.y = -1;
        dir.x = 1;
        break;
      case activeControlScheme.move_down_left.toString():
        dir.y = 1;
        dir.x = -1;
        break;
      case activeControlScheme.move_down_right.toString():
        dir.y = 1;
        dir.x = 1;
        break;
      case activeControlScheme.wait.toString():
        return this.waitCmd(stack);
      case activeControlScheme.log.toString():
        stackScreen = new LogScreen(this.game, this.make);
        break;
      case activeControlScheme.handle_door.toString():
        stackScreen = this.doorCommand();
        break;
      case activeControlScheme.grab_item.toString():
        if (this.game.inventory) return new PickupCommand(this.game);
        break;
      case activeControlScheme.inventory.toString():
        if (this.game.inventory)
          stackScreen = new InventoryScreen(this.game, this.make);
        break;
      case activeControlScheme.equipment.toString():
        if (this.game.equipment)
          stackScreen = new EquipmentScreen(this.game, this.make);
        break;
      case activeControlScheme.look.toString():
        stackScreen = new LookScreen(this.game, this.make);
        break;
      case activeControlScheme.spells.toString():
        stackScreen = new SpellScreen(this.game, this.make);
        break;
      case activeControlScheme.stats.toString():
        stackScreen = new StatsScreen(this.game, this.make);
        break;
      case activeControlScheme.menu.toString():
        stackScreen = new IngameMenuScreen(this.game, this.make, stack);
        break;
      // Debugging command
      case activeControlScheme.debug1.toString():
        stackScreen = new DebuggerScreen(this.game, this.make);
        console.log('stack: ', stack);
        console.log('game: ', this.game);
        break;
      // Debugging command
      case activeControlScheme.debug2.toString():
        break;
    }

    if (stackScreen) {
      DrawUI.clearFlash(this.game);
      stack.push(stackScreen);
      return null;
    }
    if (!dir.isEmpty())
      return alt
        ? this.digInDirection(dir, stack)
        : this.moveBumpCmd(dir, stack);

    return null;
  }

  /**
   * Creates a new DigCommand with the given direction and player/game objects,

   *
   * @param {WorldPoint} dir - The direction in which to dig.
   * @return {Command} A new DigCommand object.
   */
  private digInDirection(dir: WorldPoint, stack: Stack): Command {
    return new DigCommand(dir, this.player, this.game, stack, this.make);
  }

  /**
   * Creates a new MoveCommand with the given direction, player, and game.
   *
   * @param {WorldPoint} dir - the direction to move
   * @return {Command} the newly created MoveCommand
   */
  private moveCmd(dir: WorldPoint): Command {
    return new MoveCommand(dir, this.player, this.game);
  }

  private waitCmd(stack: Stack): Command {
    return new WaitCommand(this.player, this.game, stack, this.make);
  }

  private moveBumpCmd(dir: WorldPoint, stack: Stack): Command {
    return new MoveBumpCommand(dir, this.player, this.game, stack, this.make);
  }

  /**
   * Creates a new DoorCommand and a new CommandDirectionScreen with that command.
   *
   * @param {WorldPoint} dir - the direction to move
   * @return {Command} the newly created MoveBumpCommand
   */
  private doorCommand(): StackScreen {
    const command = new DoorCommand(this.player, this.game);
    return new CommandDirectionScreen(command, this.game, this.make);
  }

  /**
   * Executes a bullet command by creating a new BulletCommand instance with the provided stack,
   * and passing it to the direction method. The direction method returns a StackScreen.
   *
   * @param {Stack} stack - The stack object used by the BulletCommand.
   * @return {StackScreen} The StackScreen returned by the direction method.
   */
  private bulletCommand(stack: Stack): StackScreen {
    return this.direction(
      new BulletCommand(this.player, this.game, stack, this.make),
    );
  }

  /**
   * Creates a new CommandDirectionScreen with the given command and returns it as a StackScreen.
   *
   * @param {Command} command - The command to be executed.
   * @return {StackScreen} The newly created CommandDirectionScreen.
   */
  private direction(command: Command): StackScreen {
    return new CommandDirectionScreen(command, this.game, this.make);
  }
}
