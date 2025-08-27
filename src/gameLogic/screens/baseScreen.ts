import { Buff } from '../buffs/buffEnum';
import { BuffCommand } from '../commands/buffCommand';
import { CellEffects } from '../commands/cellEffects';
import { ControlSchemeManager } from '../../controls/controlSchemeManager';
import { DrawableTerminal } from '../../types/terminal/drawableTerminal';
import { DrawUI } from '../../renderer/drawUI';
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
import { EventCategory, LogMessage } from '../messages/logMessage';

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
   * @param term - The terminal to draw.
   */
  public drawScreen(term: DrawableTerminal): void {
    if (this.game.shouldShowStoryScreen) return;

    DrawUI.addDynamicEnvironmentAreaEffectsToCells(
      <GameMap>this.game.currentMap(),
    );
    DrawUI.drawMapWithPlayerCentered(
      term,
      <GameMap>this.game.currentMap(),
      this.game.player.pos,
      this.game,
    );

    DrawUI.renderPlayerHealthInfo(this.game);
    DrawUI.renderLevelDepthInfo(this.game);
    DrawUI.renderLevelTemperatureInfo(this.game);
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
   * @param stack - The stack of screens.
   * @return Returns `true` if the screen should be updated, `false` otherwise.
   */
  public onTime(stack: Stack): boolean {
    return false;
  }

  /**
   * Process the non-player character's turns.
   *
   * @param s - the stack to be processed.
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
   * @param m - the NPC performing the turn.
   * @param ply - the player involved in the turn.
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
   * Determine if the stack is over.
   *
   * @param s - the stack to check.
   * @return true if the stack is over, false otherwise.
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
   * Tick the buffs on the mob.
   * Progresses the active buffs by decrementing their timers and removing expired buffs.
   *
   * @param m - the mob to tick buffs for.
   */
  private tickBuffs(m: Mob): void {
    if (!m.buffs) return;
    m.buffs.ticks(m, this.game);
  }

  /**
   * A method to finish the turn for a given mob.
   *
   * @param m - the mob to finish the turn for.
   */
  private finishTurn(m: Mob): void {
    ++m.sinceMove;
    this.tickBuffs(m);
  }

  /**
   * Finish the player's turn.
   *
   * @param q - the turn queue.
   * @param s - the stack of screens.
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

    this.game.needs?.processPlayerNeeds(this.game, player);
    this.handleAutoHeal(player);
    this.game.stats.setMaxCarryWeight();
    this.handleEncumbrance(player);
    this.game.stats.incrementTurnCounter();
  }

  /**
   * Handle auto-healing for the player.
   *
   * @param player - the player.
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
   * Checks if the player is encumbered and applies/removes the
   * encumbered buff accordingly.
   *
   * Encumbrance is determined by the total weight of the player's
   * equipment exceeding 25% of their max carry weight.
   *
   * @param player - the player to check.
   */
  private handleEncumbrance(player: Mob): void {
    const equipmentWeight = this.game.equipment?.totalWeight() || 0;
    const maxCarryWeight = this.game.stats.maxCarryWeight;
    const isEncumbered = equipmentWeight > maxCarryWeight * 0.25; // equipment weight exceeds 25% of max carry weight.
    const hasBuff = player.is(Buff.Encumbered);

    if (isEncumbered && !hasBuff) {
      const duration = Number.MAX_SAFE_INTEGER;
      new BuffCommand(
        Buff.Encumbered,
        player,
        this.game,
        player,
        duration,
      ).execute();

      const flash = new LogMessage(
        'You are encumbered by your equipment!',
        EventCategory.buff,
      );
      if (player.isPlayer) this.game.flash(flash);
    } else if (!isEncumbered && hasBuff) {
      player.buffs.cleanse(Buff.Encumbered, this.game, player);

      const flash = new LogMessage(
        'You are no longer encumbered.',
        EventCategory.buff,
      );
      if (player.isPlayer) this.game.flash(flash);
    }
  }

  /**
   * Handles the effects of a cell on the player.
   *
   * @param cell - The cell to handle effects for.
   * @param player - The player to apply effects to.
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
   */

  /**
   * Removes the current screen and runs the NPC loop.
   *
   * @param s - The stack of Screens.
   */
  public pop_and_runNPCLoop(s: Stack): void {
    s.pop();
    this.npcTurns(s);
  }
}
