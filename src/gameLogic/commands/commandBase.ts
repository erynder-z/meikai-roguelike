import { Able } from '../../types/gameLogic/commands/able';
import { Act } from './act';
import { Buff } from '../buffs/buffEnum';
import { Command } from '../../types/gameLogic/commands/command';
import { Cost } from '../../types/gameLogic/commands/cost';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { GameState } from '../../types/gameBuilder/gameState';
import { Mob } from '../mobs/mob';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

/**
 * Abstract class representing a base command implementation that implements the Command interface.
 */
export abstract class CommandBase implements Command {
  constructor(
    public me: Mob,
    public game: GameState,
    public act: Act = Act.Act,
    public cost?: Cost,
    public target?: Mob,
  ) {}

  public setCost(cost?: Cost) {
    this.cost = cost;
  }

  /**
   * Executes the command.
   * @returns {boolean} Always throws an error, should be implemented in subclasses.
   */
  public execute(): boolean {
    throw 'no exc';
  }

  /**
   * Sets the direction of the command.
   * @param {WorldPoint} direction - The direction to set.
   * @returns {Command} The command object.
   */
  public setDirection(direction: WorldPoint): Command {
    throw 'no setDirection';
  }

  /**
   * Sets the target of the function to the specified Mob.
   *
   * @param {Mob | undefined} target - The Mob object to set as the target.
   * @return {void} This function does not return anything.
   */
  public setTarget(target: Mob): void {
    this.target = target;
  }

  /**
   * Returns true, if an items has no associated cost. If it has a cost, calls pay on that item.
   *
   * @return {boolean} True if the cost can be paid, false otherwise.
   */
  private pay(): boolean {
    if (!this.cost) return true;
    return this.cost.pay();
  }

  /**
   * Executes a turn for the mob if it is able to do so.
   * @returns {boolean} The result of executing the command.
   */
  public turn(): boolean {
    const r = this.able(<Mob>this.me, <GameState>this.game, this.act);

    if (!r.isAble) return r.usesTurn;
    if (!this.pay()) return true;
    return this.execute();
  }

  /**
   * Determines if a mob is able to perform a certain action.
   *
   * @param {Mob} mob - The mob performing the action.
   * @param {GameState} game - The game object.
   * @param {Act} act - The action being performed.
   * @returns {Able} An object indicating if the mob is able to perform the action and if it uses a turn.
   */
  public able(mob: Mob, game: GameState, act: Act): Able {
    const cant = { isAble: false, usesTurn: false };
    const negate = { isAble: false, usesTurn: true };
    const able = { isAble: true, usesTurn: false };

    const hit = act == Act.Hit;
    const move = act == Act.Move;
    const hitOrMove = hit || move;

    if (hit && this.afraid(mob, game)) return cant;
    if (hit && this.charmed(mob, game)) return cant;
    if (move && this.rooted(mob, game)) return cant;
    if (hitOrMove && this.levitate(mob, game)) return cant;

    if (this.paralyzed(mob, game)) return negate;
    if (this.asleep(mob, game)) return negate;
    if (this.slow(mob, game)) return negate;
    if (this.freeze(mob, game, move)) return negate;
    if (this.dehydrated(game)) return negate;
    if (this.ravenous(game)) return negate;

    return able;
  }

  /**
   * Checks if the given mob is afraid and flashes a message if it is the player.
   *  If afraid, the player can not attack.
   *
   * @param {Mob} me - The mob to check for fear.
   * @param {GameState} game - The game object for flashing messages.
   * @return {boolean} - Whether the mob is afraid or not.
   */
  private afraid(me: Mob, game: GameState): boolean {
    const afraid = me.is(Buff.Afraid);
    const msg = new LogMessage('You are too afraid!', EventCategory.buff);
    if (afraid && me.isPlayer) game.flash(msg);
    return afraid;
  }

  /**
   * Checks if the given mob is charmed and if it is a player. If it is, flashes a message to the game interface.
   * If charmed, the player can not attack. Charmed status is cleared if the charming spellcaster attacks the player.
   *
   * @param {Mob} me - The mob to check for charm.
   * @param {GameState} game - The game object to flash the message to.
   * @return {boolean} True if the mob is charmed, false otherwise.
   */
  private charmed(me: Mob, game: GameState): boolean {
    const charmed = me.is(Buff.Charm);
    const msg = new LogMessage("It's too cute!", EventCategory.buff);
    if (charmed && me.isPlayer) game.flash(msg);
    return charmed;
  }

  /**
   * Checks if the given mob is rooted and if it is a player, flashes a message to the game interface.
   * If rooted, the player can not move.
   *
   * @param {Mob} me - The mob to check for root.
   * @param {GameState} game - The game object to flash the message to.
   * @return {boolean} True if the mob is rooted, false otherwise.
   */
  private rooted(me: Mob, game: GameState): boolean {
    const rooted = me.is(Buff.Root);
    const msg = new LogMessage("You can't move!", EventCategory.buff);
    if (rooted && me.isPlayer) game.flash(msg);
    return rooted;
  }

  /**
   * Checks if the given mob is levitating and flashes a message if it is the player.
   * If levitating, the player can not move or attack with melee weapons.
   *
   * @param {Mob} me - The mob to check for levitation.
   * @param {GameState} game - The game object for flashing messages.
   * @return {boolean} - Whether the mob is levitating or not.
   */
  private levitate(me: Mob, game: GameState): boolean {
    const levitate = me.is(Buff.Levitate);
    const msg = new LogMessage('You are hovering!', EventCategory.buff);
    if (levitate && me.isPlayer) game.flash(msg);
    return levitate;
  }

  /**
   * Checks if the given mob is paralyzed and flashes a message if it is the player.
   * If paralyzed, the player's actions have to pass a dice roll check in order to perform them.
   *
   * @param {Mob} me - The mob to check for paralysis.
   * @param {GameState} game - The game object for flashing messages.
   * @returns {boolean} - Whether the mob is paralyzed or not.
   */
  private paralyzed(me: Mob, game: GameState): boolean {
    if (!me.is(Buff.Paralyze)) return false;
    let rate = 0;
    switch (this.act) {
      case Act.Move:
        rate = 33;
        break;
      case Act.Hit:
        rate = 25;
        break;
      case Act.Act:
        rate = 20;
        break;
    }

    const paralyzed = !game.rand.determineSuccess(rate);

    if (paralyzed) {
      const msg = new LogMessage('You are paralyzed!', EventCategory.buff);
      if (me.isPlayer) game.flash(msg);
    } else {
      const buff = me.buffs.get(Buff.Paralyze);
      buff!.timeLeft -= game.rand.randomIntegerClosedRange(1, 2);
    }
    return paralyzed;
  }

  /**
   * Checks if the given mob is asleep and flashes a message if it is the player.
   * If asleep, the player can not move or attack. Sleep status is cleared when receiving damage.
   *
   * @param {Mob} me - The mob to check for sleep.
   * @param {GameState} game - The game object to flash the message to.
   * @return {boolean} - Whether the mob is asleep or not.
   */
  private asleep(me: Mob, game: GameState): boolean {
    if (!me.is(Buff.Sleep)) return false;
    const msg = new LogMessage('You are asleep!', EventCategory.buff);
    if (me.isPlayer) game.flash(msg);
    return true;
  }

  /**
   * Checks if the given mob is slowed and flashes a message if it is the player.
   * If slowed, half of the player's actions have a 50% chance to fail.
   *
   * @param {Mob} me - The mob to check for being slowed.
   * @param {GameState} game - The game object for checking conditions and displaying messages.
   * @returns {boolean} - True if the mob is slowed, false otherwise.
   */
  private slow(me: Mob, game: GameState): boolean {
    if (!me.is(Buff.Slow)) return false;
    if (game.rand.isOneIn(2)) return false;
    const msg = new LogMessage('You are slowed!', EventCategory.buff);
    if (me.isPlayer) game.flash(msg);
    return true;
  }

  /**
   * Checks if the given mob is frozen and flashes a message if it is the player.
   *
   * @param {Mob} me - The mob to check for freezing.
   * @param {GameState} game - The game object for flashing messages.
   * @param {boolean} move - Indicates if the mob is trying to move.
   * @returns {boolean} - Whether the mob is frozen or not.
   */
  private freeze(me: Mob, game: GameState, move: boolean): boolean {
    if (!me.is(Buff.Freeze)) return false;
    if (move && game.rand.isOneIn(2)) return false;
    const msg = new LogMessage('You are frozen!', EventCategory.buff);
    if (me.isPlayer) game.flash(msg);
    return true;
  }

  /**
   * Checks if the mob is confused and updates the direction accordingly.
   *
   * @param {GameState} game - The game object for handling randomness.
   * @param {WorldPoint} dir - The direction to update.
   * @returns {boolean} Whether the mob is confused or not.
   */
  public confused(game: GameState, dir: WorldPoint): boolean {
    if (!this.me.is(Buff.Confuse)) return false;

    const r = game.rand;
    if (r.isOneIn(2)) return false;
    const msg = new LogMessage('You are confused!', EventCategory.buff);
    if (this.me.isPlayer) game.flash(msg);

    const cd = r.randomDirectionForcedMovement();
    dir.x = cd.x;
    dir.y = cd.y;
    return true;
  }

  /**
   * Checks if the player is dehydrated and flashes a message if it is.
   *
   * @param {GameState} game - The game object for flashing messages.
   * @returns {boolean} - Whether the player is dehydrated or not.
   */
  private dehydrated(game: GameState): boolean {
    const dehydrated = game.stats.thirst >= 0.8;
    const chance = this.game.rand.isOneIn(5);
    const msg = new LogMessage(
      'You can not concentrate! You need to drink something!',
      EventCategory.unable,
    );
    if (this.me.isPlayer && dehydrated && chance) game.flash(msg);
    return dehydrated && chance;
  }

  /**
   * Checks if the mob is ravenous and, if it is a player, flashes a message to the game interface.
   * If ravenous, the player may have difficulty concentrating.
   *
   * @param {GameState} game - The game object for flashing messages.
   * @return {boolean} True if the mob is ravenous and the chance condition is met, false otherwise.
   */
  private ravenous(game: GameState): boolean {
    const ravenous = game.stats.hunger >= 0.8;
    const chance = this.game.rand.isOneIn(5);
    const msg = new LogMessage(
      'You can not concentrate! You need to eat something!',
      EventCategory.unable,
    );
    if (this.me.isPlayer && ravenous && chance) game.flash(msg);
    return ravenous && chance;
  }

  /**
   * Executes the command directly.
   * @returns {boolean} The result of executing the command.
   */
  public raw(): boolean {
    return this.execute();
  }

  /**
   * Executes a non-player character (NPC) turn.
   * @returns {boolean} The result of executing the command.
   */
  public npcTurn(): boolean {
    return this.turn();
  }
}
