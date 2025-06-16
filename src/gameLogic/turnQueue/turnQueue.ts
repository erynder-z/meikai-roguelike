import { Mob } from '../mobs/mob';

/**
 * Represents a turn queue for managing the order of mobs' turns.
 */
export class TurnQueue {
  public mobs: Mob[] = [];
  /**
   * A method that returns the current mob.
   *
   * @return {Mob} the first mob in the mobs array
   */
  public currentMob(): Mob {
    return this.mobs[0];
  }

  /**
   * Pushes a mob into the mobs array.
   *
   * @param {Mob} m - the mob to be pushed
   */
  public pushMob(m: Mob): void {
    this.mobs.push(m);
  }
  /**
   * A description of the entire function.
   *
   * @return {Mob} the first item removed from the mobs array
   */
  public popMob(): Mob {
    return <Mob>this.mobs.shift();
  }

  /**
   * Removes the specified Mob from the list of mobs.
   *
   * @param {Mob} m - the Mob to be removed
   */
  public removeMob(m: Mob): boolean {
    const index = this.mobs.indexOf(m);
    if (index < 0) return false;
    this.mobs.splice(index, 1);
    return true;
  }

  /**
   * Pushes the given mob to the front of the mobs array.
   *
   * @param {Mob} m - the mob to be pushed to the front
   */
  public pushMobToFront(m: Mob): void {
    this.mobs.unshift(m);
  }

  /**
   * A method to move to the next item in the list.
   *
   * @return {Mob} the next mob
   */
  public next(): Mob {
    this.pushMob(this.popMob());
    return this.currentMob();
  }
}
