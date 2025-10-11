import { GameState } from '../../shared-types/gameBuilder/gameState';
import { BuffType } from '../../shared-types/gameLogic/buffs/buffType';
import { MobMessagesHandler } from '../../ui/messages/mobMessagesHandler';
import { GrammarHandler } from '../../utilities/grammarHandler';
import { EventCategory, LogMessage } from '../messages/logMessage';
import { Mob } from '../mobs/mob';
import { Buff } from './buffEnum';

/**
 * Handles managing buffs on a mob.
 */
export class ActiveBuffs {
  private map: Map<Buff, BuffType> = new Map();

  /**
   * @returns A map with the buffs of a mob.
   */
  public getBuffsMap(): Map<Buff, BuffType> {
    return this.map;
  }

  /**
   * Adds a buff to the collection of active buffs for a given mob.
   *
   * @param buffType - The buff to add.
   * @param game - The game object.
   * @param mob - The mob to apply the buff to.
   */
  public add(buffType: BuffType, game: GameState, mob: Mob): void {
    const buff = buffType.buff;
    const alreadyHasBuff = this.map.has(buff);

    this.map.set(buff, buffType);

    if (this.shouldDisplayBuffMessage(alreadyHasBuff, game, mob))
      this.displayBuffMessage(buff, game, mob);
  }

  /**
   * Remove a buff from the collection of active buffs for a given mob.
   *
   * @param b - The buff to remove.
   * @param game - The game object.
   * @param mob - The mob to remove the buff from.
   */
  public remove(b: BuffType, game: GameState, mob: Mob): void {
    this.map.delete(b.buff);
    const buffAdj = GrammarHandler.BuffToAdjective(b.buff) || b.buff;
    const msg = new LogMessage(
      `You are no longer ${buffAdj}!`,
      EventCategory.buff,
    );
    if (mob.isPlayer) game.message(msg);
  }

  /**
   * Checks if a specific type of buff is currently active on the mob.
   *
   * @param buff - The buff to check.
   * @returns True if the buff is active, false otherwise.
   */
  public is(buff: Buff): boolean {
    return this.map.has(buff);
  }

  /**
   * Gets the information of the buff of a specific type currently active on the mob.
   *
   * @param buff - The buff to get information for.
   * @returns The information of the buff if active, otherwise undefined.
   */
  public get(buff: Buff): BuffType | undefined {
    return this.map.get(buff);
  }

  /**
   * Cleanses a specific type of buff from the mob, removing it from the active buffs collection.
   *
   * @param buff - The buff to cleanse.
   * @param game - The game object.
   * @param mob - The mob to cleanse the buff from.
   */
  public cleanse(buff: Buff, game: GameState, mob: Mob): void {
    const b = mob.buffs.get(buff);
    if (b) this.remove(b, game, mob);
  }

  /**
   * Progresses the active buffs by decrementing their timers and removing expired buffs.
   *
   * @param mob - The mob to process active buffs for.
   * @param game - The game object.
   */
  public ticks(mob: Mob, game: GameState): void {
    for (const b of this.map.values()) {
      --b.timeLeft;
      if (b.effect) b.effect.tick(b.duration, b.timeLeft);
      if (b.timeLeft <= 0) this.remove(b, game, mob);
    }
  }

  /**
   * Determines whether a buff message should be displayed to the player.
   *
   * @param alreadyHasBuff - Whether the mob already has the buff.
   * @param game - The game object.
   * @param mob - The mob to check visibility and type.
   * @return True if the buff message should be displayed, false otherwise.
   */
  private shouldDisplayBuffMessage(
    alreadyHasBuff: boolean,
    game: GameState,
    mob: Mob,
  ): boolean {
    const isPlayer = mob.isPlayer;
    const shouldDisplayMessage = !alreadyHasBuff;

    if (isPlayer) {
      return shouldDisplayMessage;
    } else {
      const isVisibleToPlayer =
        MobMessagesHandler.shouldDisplayMessageBasedOnVisibility(
          game,
          mob,
          game.player,
        );

      return isVisibleToPlayer;
    }
  }

  /**
   * Displays the buff message for the mob.
   *
   * @param buff - The buff to describe.
   * @param game - The game object.
   * @param mob - The mob to apply the buff to.
   */
  private displayBuffMessage(buff: Buff, game: GameState, mob: Mob): void {
    const buffAdjective = GrammarHandler.BuffToAdjective(buff) || buff;
    const message = new LogMessage(
      `${mob.isPlayer ? 'You are' : `${mob.name} is`} ${buffAdjective}!`,
      EventCategory.buff,
    );
    game.message(message);
  }
}
