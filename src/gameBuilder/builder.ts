import { AISwitcher } from '../gameLogic/mobs/aiSwitcher';
import { Build } from '../types/gameBuilder/build';
import { GameConfigType } from '../types/gameConfig/gameConfigType';
import { FindFreeSpace } from '../maps/helpers/findFreeSpace';
import { Game } from './gameModel';
import { GameMapType } from '../types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../types/gameBuilder/gameState';
import { Glyph } from '../gameLogic/glyphs/glyph';
import { Inventory } from '../gameLogic/inventory/inventory';
import { ItemObject } from '../gameLogic/itemObjects/itemObject';
import { ItemObjectManager } from '../gameLogic/itemObjects/itemObjectManager';
import { MapGenerator1 } from '../maps/mapGenerator/mapGenerator';
import { MapGenerator_Cave } from '../maps/mapGenerator/mapGenerator_Cave';
import { MapGenerator_Maze } from '../maps/mapGenerator/mapGenerator_Maze';
import { Mob } from '../gameLogic/mobs/mob';
import { MobAI } from '../types/gameLogic/mobs/mobAI';
import { MoodAI } from '../gameLogic/mobs/moodAI';
import { ObjCategory } from '../gameLogic/itemObjects/itemCategories';
import { Overworld } from '../maps/staticMaps/overworld';
import { RandomGenerator } from '../randomGenerator/randomGenerator';
import { SaveStateHandler } from '../savestates/saveStateHandler';
import { SerializedGameState } from '../types/utilities/saveStateHandler';
import { Slot } from '../gameLogic/itemObjects/slot';
import { Spell } from '../gameLogic/spells/spell';
import { TerminalPoint } from '../terminal/terminalPoint';
import { WorldPoint } from '../maps/mapModel/worldPoint';

/**
 * The builder for creating games, levels and mobs.
 */
export class Builder implements Build {
  constructor(
    public seed: GameConfigType['seed'],
    public player: GameConfigType['player'],
  ) {}

  /**
   * Create and return a new Game instance.
   *
   * @return {GameState} The newly created Game instance
   */
  public makeGame(): GameState {
    const rand = new RandomGenerator(this.seed);
    const player = this.makePlayer();
    const game = new Game(rand, player, this);
    game.surfaceTemp = rand.randomFloatInclusive(2, 15);
    game.dungeon.level = 0;
    this.enterFirstLevel(game, rand);
    game.ai = this.makeAI();
    this.initLevel0(game);

    return game;
  }

  public restoreGame(saveState: SerializedGameState): GameState {
    const saveStateHandler = new SaveStateHandler();
    const rand = new RandomGenerator(saveState.serializedBuild.data.seed);
    const dungeonLevel = saveState.serializedDungeon.data.level;

    const playerPos = new WorldPoint(
      saveState.serializedPlayer.data.pos.x,
      saveState.serializedPlayer.data.pos.y,
    );

    const player = saveStateHandler.restorePlayer(saveState);
    const game = new Game(rand, player, this);
    // Mind the order of these calls. The wrong order may cause issues.
    saveStateHandler.restorePlayerBuffs(game, player, saveState);
    saveStateHandler.restorePlayerInventory(game, saveState);
    saveStateHandler.restorePlayerEquipment(game, saveState);
    saveStateHandler.restoreStats(game, saveState);
    saveStateHandler.restoreLog(game, saveState);

    this.enterSpecificLevelAtPos(game, dungeonLevel, playerPos);

    saveStateHandler.restoreDungeon(
      game,
      saveState.serializedDungeon.data,
      player,
    );

    game.ai = this.makeAI();

    return game;
  }

  /**
   * A function to make a level using the given random generator and level number.
   *
   * @param {RandomGenerator} rand - the random generator to use
   * @param {number} level - the level number
   * @return {GameMapType} the generated map
   */
  public makeLevel(
    rand: RandomGenerator,
    level: number,
    surfaceTemp: number,
  ): GameMapType {
    const map = this.makeMap(rand, level, surfaceTemp);
    this.addLevelStairs(map, level, rand);
    this.addMobsToLevel(map, rand);
    this.addItems(map, rand);
    return map;
  }

  /**
   * Generates a map using the given random generator and level number.
   *
   * @param {RandomGenerator} rand - the random generator to use
   * @param {number} level - the level-number for the map
   * @return {GameMapType} the generated map
   */
  public makeMap(
    rand: RandomGenerator,
    level: number,
    surfaceTemp: number,
  ): GameMapType {
    const dim = TerminalPoint.MapDimensions;
    const wdim = new WorldPoint(dim.x, dim.y);

    let map;

    switch (level) {
      case 0:
        map = Overworld.generate(rand, level);
        break;
      case 1:
        map = MapGenerator1.generate(wdim, rand, level);
        break;
      case 2:
        map = MapGenerator_Cave.generate(rand, level);
        break;
      case 3:
        map = MapGenerator_Maze.generate(rand, level);
        break;
      default:
        map = MapGenerator1.generate(wdim, rand, level);
        break;
    }

    map.setEnvironmentDescriptions();
    map.setLevelTemperature(surfaceTemp);

    // add a 10% chance of the map being dark if it's not level 0
    if (level !== 0 && rand.isOneIn(10)) {
      map.isDark = true;
    }

    return map;
  }

  /**
   * enter the first level of the game.
   *
   * @param {GameState} game - the game object
   * @return {void}
   */
  private enterFirstLevel(game: GameState, rand: RandomGenerator): void {
    const dungeon = game.dungeon;
    const map = dungeon.currentMap(game);
    /*     const np = this.centerPos(map.dimensions); */

    const np = <WorldPoint>FindFreeSpace.findFree(map, rand);

    game.dungeon.playerSwitchLevel(dungeon.level, np, game);
  }

  private enterSpecificLevelAtPos(
    game: GameState,
    level: number,
    pos: WorldPoint,
  ): void {
    game.dungeon.playerSwitchLevel(level, pos, game);
  }
  /**
   * Calculates the center position of the given WorldPoint dimensions.
   *
   * @param {WorldPoint} dim - the dimensions for which to calculate the center position
   * @return {WorldPoint} the center position of the given dimensions
   */
  private centerPos(dim: WorldPoint): WorldPoint {
    return new WorldPoint(Math.floor(dim.x / 2), Math.floor(dim.y / 2));
  }

  /**
   * Creates a new player Mob.
   *
   * @return {Mob} a new player Mob
   */
  public makePlayer(): Mob {
    const player = new Mob(Glyph.Player, 20, 12);
    player.name = this.player.name;
    player.hp = 9999;
    player.maxhp = 9999;
    return player;
  }

  /**
   * Create and return a new MobAI instance, or null if unable to create one.
   *
   * @return {MobAI | null} The created MobAI instance, or null if unable to create one.
   */
  public makeAI(): MobAI | null {
    return new AISwitcher(MoodAI.stockMoodShootAI(1, 8));
  }

  /**
   * Generates a ring of mobs around a central point on the map.
   *
   * @param {Glyph} glyph - the glyph representing the mob
   * @param {GameMapType} map - the map on which the mobs will be generated
   * @param {RandomGenerator} rand - the random generator for determining mob positions
   * @return {void}
   */
  public makeRingOfMobs(
    glyph: Glyph,
    map: GameMapType,
    rand: RandomGenerator,
  ): void {
    const dim = map.dimensions;
    const c = new WorldPoint(Math.floor(dim.x / 2), Math.floor(dim.y / 2));
    const p = new WorldPoint();

    for (p.y = 1; p.y < dim.y - 1; p.y++) {
      for (p.x = 1; p.x < dim.x - 1; p.x++) {
        const d = c.distanceTo(p);
        if (d < 7 || d > 9) {
          continue;
        }
        if (map.isBlocked(p)) {
          continue;
        }
        this.addNPC(glyph, p.x, p.y, map, 0);
      }
    }
  }

  private makeTestMob(map: GameMapType, ply: Mob): void {
    const mob = Glyph.Druid;
    const pos = ply.pos;

    const p = new WorldPoint(pos.x, pos.y);
    let x = pos.x;
    let y = pos.y;

    // Place the mob next to the player
    if (Math.random() < 0.5) {
      x += 1; // Place to the right of the player
    } else {
      x -= 1; // Place to the left of the player
    }

    if (Math.random() < 0.5) {
      y += 1; // Place below the player
    } else {
      y -= 1; // Place above the player
    }

    p.x = x;
    p.y = y;

    this.addNPC(mob, p.x, p.y, map, 1);
  }
  /**
   * Adds a new non-playable character to the map at the specified position and level.
   *
   * @param {Glyph} glyph - the visual representation of the NPC
   * @param {number} x - the x-coordinate of the NPC on the map
   * @param {number} y - the y-coordinate of the NPC on the map
   * @param {GameMapType} map - the map to which the NPC is being added
   * @param {number} level - the level of the NPC
   * @return {Mob} the newly added NPC
   */
  public addNPC(
    glyph: Glyph,
    x: number,
    y: number,
    map: GameMapType,
    level: number,
  ): Mob {
    const mob = new Mob(glyph, x, y);
    this.setLevelStats(mob, level);
    map.addNPC(mob);
    return mob;
  }

  /**
   * Sets the level-related statistics of a Mob.
   *
   * @param {Mob} mob - The Mob whose statistics are being set.
   * @param {number} mobLevel - The level of the Mob.
   * @return {void}
   */
  private setLevelStats(mob: Mob, mobLevel: number): void {
    mob.level = mobLevel;
    mob.maxhp = mobLevel * 5;
    mob.hp = mob.maxhp;
  }

  /**
   * Adds level stairs to the map based on the level and random generator provided.
   * @param {GameMapType} map - The map to which stairs are being added.
   * @param {number} level - The level for which stairs are being added.
   * @param {RandomGenerator} rand - The random generator used for adding stairs.
   * @returns {void}
   */
  private addLevelStairs(
    map: GameMapType,
    level: number,
    rand: RandomGenerator,
  ): void {
    if (level === 0) {
      this.addStairs0(map, rand);
    } else {
      this.addStairs(map, rand);
    }
  }

  /**
   * Adds stairs for level to the map at a specified position.
   * @param {GameMapType} map - The map to which stairs are being added.
   * @returns {void}
   */
  private addStairs0(map: GameMapType, rand: RandomGenerator): void {
    const pos = this.centerPos(map.dimensions);
    const x = 3;
    const y = 0;
    const p = new WorldPoint(x, y).addTo(pos);

    if (!map.cell(p).isBlocked) {
      map.cell(p).env = Glyph.Stairs_Down;
      map.addStairInfo(Glyph.Stairs_Down, p);
    } else {
      this.addStair(map, rand, Glyph.Stairs_Down);
    }
  }

  /**
   * Adds stairs for a level to the map.
   * @param {GameMapType} map - The map to which stairs are being added.
   * @returns {void}
   */
  private addStairs(map: GameMapType, rand: RandomGenerator): void {
    this.addStair(map, rand, Glyph.Stairs_Down);
    this.addStair(map, rand, Glyph.Stairs_Up);
  }

  /**
   * Adds stairs to the map based on the provided glyph and random generator.
   * @param {GameMapType} map - The map to which stairs are being added.
   * @param {RandomGenerator} rand - The random generator used for adding stairs.
   * @param {Glyph} stair - The glyph representing the stairs.
   * @returns {boolean} True if stairs are successfully added, otherwise false.
   */
  private addStair(
    map: GameMapType,
    rand: RandomGenerator,
    stair: Glyph.Stairs_Up | Glyph.Stairs_Down,
  ): boolean {
    const p = <WorldPoint>FindFreeSpace.findFree(map, rand);
    map.cell(p).env = stair;
    map.addStairInfo(stair, p);

    return true;
  }

  /**
   * Adds mobs to the level based on the map and random generator provided.
   * @param {GameMapType} map - The map to which mobs are being added.
   * @param {RandomGenerator} rand - The random generator used for adding mobs.
   * @returns {void}
   */
  private addMobsToLevel(map: GameMapType, rand: RandomGenerator): void {
    switch (map.level) {
      case 0:
        //TODO this.makeFriendlyNPCs(map, rand);
        break;
      default:
        this.makeMobs(map, rand, 15);
        break;
    }
  }

  /**
   * Makes mobs on the map using the provided random generator and glyph.
   * @param {GameMapType} map - The map on which the mobs will be created.
   * @param {RandomGenerator} rand - The random generator used to determine the placement of the mobs.
   * @param {Glyph} glyph - The glyph representing the mobs.
   * @param {number} rate - The rate of mob creation.
   * @returns {void}
   */
  private makeMobs(
    map: GameMapType,
    rand: RandomGenerator,
    rate: number,
  ): void {
    const dim = map.dimensions;
    const p = new WorldPoint();
    for (p.y = 1; p.y < dim.y - 1; ++p.y) {
      for (p.x = 1; p.x < dim.x - 1; ++p.x) {
        if (map.isBlocked(p)) {
          continue;
        }
        if (!rand.isOneIn(rate)) {
          continue;
        }
        this.addMapLevel_Mob(p, map, rand);
      }
    }
  }

  /**
   * Adds a mob to the map at the specified position based on the map level and random generator provided.
   * @param {WorldPoint} pos - The position where the mob is added.
   * @param {GameMapType} map - The map to which the mob is being added.
   * @param {RandomGenerator} rand - The random generator used for adjusting the level.
   * @return {Mob} The added mob.
   */
  public addMapLevel_Mob(
    pos: WorldPoint,
    map: GameMapType,
    rand: RandomGenerator,
  ): Mob {
    const baseLevel = map.level;
    let level = rand.adjustLevel(baseLevel);

    if (level < 1) level = 1;

    const glyphName = this.getGlyphNameByLevel(level);

    if (!glyphName) {
      console.warn(`No glyph found for level ${level}. Using default glyph.`);
      return this.addNPC(Glyph.Player, pos.x, pos.y, map, level);
    }

    const glyph = Glyph[glyphName as keyof typeof Glyph];

    return this.addNPC(glyph, pos.x, pos.y, map, level);
  }

  /**
   * Maps the level to the corresponding Glyph name.
   *
   * @param {number} level - The level number.
   * @return {string | null} The Glyph name or null if not found.
   */
  private getGlyphNameByLevel(level: number): string | null {
    const glyphNames = Object.keys(Glyph).filter(key => isNaN(Number(key)));

    // Adjust the mapping logic based on your game's design
    // For example, level 1 -> 'Ant', level 2 -> 'Bat', etc.

    // Ensure that the glyphNames array is ordered appropriately
    if (level >= 1 && level <= glyphNames.length) {
      return glyphNames[level];
    }

    return null;
  }

  /**
   * Adds items to the map.
   *
   * @param {GameMapType} map - The map to which the mob is being added.
   * @param {RandomGenerator} rand - The random generator used for adjusting the level.
   */
  private addItems(map: GameMapType, rand: RandomGenerator): void {
    for (let p = new WorldPoint(); p.y < map.dimensions.y; ++p.y) {
      for (p.x = 0; p.x < map.dimensions.x; ++p.x) {
        if (map.isBlocked(p)) {
          continue;
        }
        if (!rand.isOneIn(40)) {
          continue;
        }
        ItemObjectManager.addRandomObjectForLevel(p, map, rand, map.level);
      }
    }
  }

  /**
   * Initializes level 0 of the game.
   *
   * @param {Game} game - The game object.
   * @return {void} No return value.
   */
  private initLevel0(game: Game): void {
    const L0 = game.dungeon.getLevel(0, game);
    this.addItemToPlayerInventory(<Inventory>game.inventory);
    this.addItemNextToPlayer(game.player, L0);
    this.makeTestMob(L0, game.player);
  }

  /**
   * Adds items next to the player on the map.
   *
   * @param {Mob} player - The player object.
   * @param {GameMapType} map - The map where items are added.
   * @return {void} No return value.
   */
  private addItemNextToPlayer(player: Mob, map: GameMapType): void {
    const a = player.pos;
    let p = new WorldPoint(a.x, a.y + 2);
    map.addObject(
      new ItemObject(Glyph.Shield, Slot.OffHand, [ObjCategory.Armor]),
      p,
    );
    map.cell(p).env = Glyph.Regular_Floor;

    p = new WorldPoint(a.x, a.y + 1);
    map.addObject(
      new ItemObject(
        Glyph.Rune,
        Slot.NotWorn,
        [ObjCategory.SpellItem],
        Spell.Poison,
      ),
      p,
    );
    map.cell(p).env = Glyph.Regular_Floor;
  }

  /**
   * Adds items to the player's inventory.
   *
   * @param {Inventory} inv - The inventory to add the item to.
   * @return {void} This function does not return anything.
   */
  private addItemToPlayerInventory(inv: Inventory): void {
    inv.add(
      new ItemObject(Glyph.Dagger, Slot.MainHand, [ObjCategory.MeleeWeapon]),
    );

    inv.add(
      new ItemObject(
        Glyph.Potion,
        Slot.NotWorn,
        [ObjCategory.Consumable, ObjCategory.Special],
        Spell.Heal,
      ),
    );

    const rune1 = new ItemObject(
      Glyph.Rune,
      Slot.NotWorn,
      [ObjCategory.SpellItem, ObjCategory.Special],
      Spell.Teleport,
    );
    rune1.charges = 2;
    inv.add(rune1);

    const rune2 = new ItemObject(
      Glyph.Rune,
      Slot.NotWorn,
      [ObjCategory.SpellItem, ObjCategory.Special],
      Spell.Bullet,
    );
    rune2.charges = 1;
    inv.add(rune2);

    const pistol = new ItemObject(
      Glyph.Pistol,
      Slot.NotWorn,
      [ObjCategory.RangedWeapon, ObjCategory.Special],
      Spell.Bullet,
    );
    pistol.charges = 10;
    inv.add(pistol);

    const strongDagger = new ItemObject(Glyph.Dagger, Slot.MainHand, [
      ObjCategory.MeleeWeapon,
    ]);
    strongDagger.level = 50;
    inv.add(strongDagger);

    const strongPistol = new ItemObject(
      Glyph.Pistol,
      Slot.NotWorn,
      [ObjCategory.RangedWeapon, ObjCategory.Special],
      Spell.Bullet,
    );
    strongPistol.level = 50;
    strongPistol.charges = 10;
    inv.add(strongPistol);

    const ration = new ItemObject(
      Glyph.Ration,
      Slot.NotWorn,
      [ObjCategory.Consumable],
      Spell.DecreaseHunger,
    );

    ration.effectMagnitude = 0.25;
    inv.add(ration);

    const waterBottle = new ItemObject(
      Glyph.Water_Bottle,
      Slot.NotWorn,
      [ObjCategory.Consumable],
      Spell.DecreaseThirst,
    );
    waterBottle.effectMagnitude = 0.25;
    inv.add(waterBottle);

    for (let index = 0; index < 10; index++) {
      const potion = new ItemObject(
        Glyph.Potion,
        Slot.NotWorn,
        [ObjCategory.Consumable],
        Spell.Heal,
        1,
        'some potion',
        1,
      );

      inv.add(potion);
    }
  }
}
