import { Buff } from '../buffs/buffEnum';
import { BuffCommand } from '../commands/buffCommand';
import { CellEffects } from '../commands/cellEffects';
import { ControlSchemeManager } from '../../controls/controlSchemeManager';
import { DrawableTerminal } from '../../types/terminal/drawableTerminal';
import { DrawUI } from '../../renderer/drawUI';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { gameConfigManager } from '../../gameConfigManager/gameConfigManager';
import { GameMap } from '../../maps/mapModel/gameMap';
import { GameState } from '../../types/gameBuilder/gameState';
import { HealthAdjust } from '../commands/healthAdjust';
import { MapCell } from '../../maps/mapModel/mapCell';
import { Mob } from '../mobs/mob';
import { ScreenMaker } from '../../types/gameLogic/screens/ScreenMaker';
import { Stack } from '../../types/terminal/stack';
import { StackScreen } from '../../types/terminal/stackScreen';
import { TurnQueue } from '../turnQueue/turnQueue';

/**
 * Represents a base screen implementation that implements the StackScreen interface.
 */
export class BaseScreen implements StackScreen {
  public name = 'BaseScreen';
  public gameConfig = gameConfigManager.getConfig();
  private currentScheme = this.gameConfig.control_scheme || 'default';
  public controlSchemeManager: ControlSchemeManager;
  public activeControlScheme: Record<string, string[]>;
  constructor(
    public game: GameState,
    public make: ScreenMaker,
  ) {
    this.controlSchemeManager = new ControlSchemeManager(this.currentScheme);
    this.activeControlScheme = this.controlSchemeManager.getActiveScheme();
  }

  /**
   * Draw the terminal.
   *
   * @param {DrawableTerminal} term - the terminal to draw
   * @return {void}
   */
  public drawScreen(term: DrawableTerminal): void {
    DrawUI.addDynamicEnvironmentAreaEffectsToCells(
      <GameMap>this.game.currentMap(),
    );
    DrawUI.drawMapWithPlayerCentered(
      term,
      <GameMap>this.game.currentMap(),
      this.game.player.pos,
      this.game,
    );
    DrawUI.renderMiscInfo(this.game);
    DrawUI.renderBuffs(this.game);
    DrawUI.renderEquipment(this.game);
    DrawUI.renderMessage(this.game);
    DrawUI.renderFlash(this.game);
    DrawUI.renderActionImage(this.game);
  }

  public handleKeyDownEvent(event: KeyboardEvent, stack: Stack): void {}

  /**
   * Determines if the screen should be updated based on time.
   *
   * @param {Stack} stack - The stack of screens.
   * @return {boolean} Returns `true` if the screen should be updated, `false` otherwise.
   */
  public onTime(stack: Stack): boolean {
    return false;
  }

  /**
   * Process the non-player character's turns.
   *
   * @param {Stack} s - the stack to be processed
   * @return {void}
   */
  public npcTurns(s: Stack): void {
    const player = <Mob>this.game.player;
    const map = <GameMap>this.game.currentMap();

    const { queue } = map;

    this.finishPlayerTurn(queue, s);

    if (queue.mobs.length <= 0) return;

    let m: Mob;

    for (m = queue.next(); !m.isPlayer && !this.over(s); m = queue.next()) {
      this.npcTurn(m, player, s);
    }
    HealthAdjust.displayCumulativePlayerDamageMessage(this.game);
    this.game.stats.resetCurrentTurnReceivedDmg();
  }

  /**
   * Perform the NPC's turn in the game.
   *
   * @param {Mob} m - the NPC performing the turn
   * @param {Mob} ply - the player involved in the turn
   */
  private npcTurn(m: Mob, ply: Mob, stack: Stack): void {
    const { ai } = this.game;

    const map = <GameMap>this.game.currentMap();
    const currentCell = map.cell(m.pos);

    if (ai) ai.turn(m, ply, this.game, stack, this.make);
    if (!m.isAlive()) return; // mob died during turn
    this.handleCellEffects(currentCell, m);
    if (!m.isAlive()) return; // mob died during cell effects
    this.finishTurn(m);
  }

  /**
   * Determine if the stack is over
   *
   * @param {Stack} s - the stack to check
   * @return {boolean} true if the stack is over, false otherwise
   */
  private over(s: Stack): boolean {
    const over = !this.game.player.isAlive();
    if (over) {
      s.removeAllScreens();
      s.push(this.make.gameOver(this.game));
    }
    return over;
  }

  /**
   * tickBuffs - A function to handle ticking buffs for a mob.
   *
   * @param {Mob} m - The mob to tick buffs for
   * @return {void}
   */
  private tickBuffs(m: Mob): void {
    if (!m.buffs) return;
    m.buffs.ticks(m, this.game);
  }

  /**
   * A method to finish the turn for a given mob.
   *
   * @param {Mob} m - the mob to finish the turn for
   * @return {void}
   */
  private finishTurn(m: Mob): void {
    ++m.sinceMove;
    this.tickBuffs(m);
  }

  /**
   * Finish the player's turn.
   *
   * @param {TurnQueue} q - the turn queue
   * @param {Stack} s - the stack of screens
   * @return {void}
   */
  private finishPlayerTurn(q: TurnQueue, s: Stack): void {
    const player = q.currentMob();
    const map = <GameMap>this.game.currentMap();
    const currentCell = map.cell(player.pos);

    if (!player.isPlayer) return;

    this.finishTurn(player);
    this.handleCellEffects(currentCell, player);

    if (!player.isAlive()) {
      this.over(s);
      return;
    }

    if (this.game.needs) {
      this.game.needs.processPlayerNeeds(this.game, player);
    }
    this.handleAutoHeal(player);
    this.game.stats.incrementTurnCounter();
  }

  /**
   * Handle auto-healing for the player.
   *
   * @param {Mob} player - the player
   * @return {void}
   */
  private handleAutoHeal(player: Mob): void {
    if (this.game.autoHeal) {
      const tooHungry = this.game.stats.hunger >= 0.6;
      const tooThirsty = this.game.stats.thirst >= 0.6;

      if (tooHungry || tooThirsty) return;

      this.game.autoHeal.turn(player, this.game);
    }
  }

  /**
   * Handles the effects of a cell on the player.
   *
   * @param {MapCell} cell - The cell to handle effects for.
   * @param {Mob} player - The player to apply effects to.
   * @return {void} This function does not return a value.
   */
  private handleCellEffects(cell: MapCell, player: Mob): void {
    const map = <GameMap>this.game.currentMap();

    new CellEffects(player, this.game, map, cell).applyCellEffects();
  }
  /**
   * Handle cleansing fire buffs if the player is on a cell that removes them.
   *
   * @param {MapCell} cell - the current cell of the player
   * @param {Mob} player - the player
   * @return {void}
   */

  /**
   * Removes the current screen and runs the NPC loop.
   * @param {Stack} s - The stack of Screens.
   * @returns {void}
   */
  public pop_and_runNPCLoop(s: Stack): void {
    s.pop();
    this.npcTurns(s);
  }
}
