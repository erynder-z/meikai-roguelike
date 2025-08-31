import { AISwitcher } from '../gameLogic/mobs/aiSwitcher';
import { Build } from '../shared-types/gameBuilder/build';
import { GameConfig } from '../shared-types/gameConfig/gameConfig';
import { FindFreeSpace } from '../maps/helpers/findFreeSpace';
import { Game } from './gameModel';
import { GameMapType } from '../shared-types/gameLogic/maps/mapModel/gameMapType';
import { GameState } from '../shared-types/gameBuilder/gameState';
import { Glyph } from '../gameLogic/glyphs/glyph';
import { Inventory } from '../gameLogic/inventory/inventory';
import { ItemObject } from '../gameLogic/itemObjects/itemObject';
import { ItemObjectManager } from '../gameLogic/itemObjects/itemObjectManager';
import { MapGenerator1 } from '../maps/mapGenerator/mapGenerator';
import { MapGenerator_Cave } from '../maps/mapGenerator/mapGenerator_Cave';
import { MapGenerator_Maze } from '../maps/mapGenerator/mapGenerator_Maze';
import { Mob } from '../gameLogic/mobs/mob';
import { MobAI } from '../shared-types/gameLogic/mobs/mobAI';
import { MoodAI } from '../gameLogic/mobs/moodAI';
import { ObjCategory } from '../gameLogic/itemObjects/itemCategories';
import { Overworld } from '../maps/staticMaps/overworld';
import { RandomGenerator } from '../randomGenerator/randomGenerator';
import { SaveStateHandler } from '../savestates/saveStateHandler';
import { SerializedGameState } from '../shared-types/utilities/saveStateHandler';
import { Slot } from '../gameLogic/itemObjects/slot';
import { Spell } from '../gameLogic/spells/spell';
import { TerminalPoint } from '../terminal/terminalPoint';
import { WorldPoint } from '../maps/mapModel/worldPoint';

/**
 * The builder for creating games, levels and mobs.
 */
export class Builder implements Build {
  constructor(
    public seed: GameConfig['seed'],
    public player: GameConfig['player'],
  ) {}

  /**
   * Create and return a new Game instance.
   *
   * @return The newly created Game instance.
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

  /**
   * Restores a game state from a serialized save state.
   *
   * @param saveState - The serialized game state to restore from.
   * @returns The restored game state.
   */
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
    saveStateHandler.restoreShownStoryLevels(game, saveState);

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
   * @param rand - The random generator to use.
   * @param level - The level number.
   * @return The generated map.
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
   * @param rand - The random generator to use.
   * @param level - The level-number for the map.
   * @return The generated map.
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
    map.setLevelDepth();
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
   * @param game - The game object.
   */
  private enterFirstLevel(game: GameState, rand: RandomGenerator): void {
    const dungeon = game.dungeon;
    const map = dungeon.currentMap(game);
    /*     const np = this.centerPos(map.dimensions); */

    const np = <WorldPoint>FindFreeSpace.findFree(map, rand);

    game.dungeon.playerSwitchLevel(dungeon.level, np, game);
  }

  /**
   * Enters the player into the specified level at the given position.
   *
   * @param game - The game object.
   * @param level - The level number.
   * @param pos - The position on the level to enter.
   */
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
   * @param dim - the dimensions for which to calculate the center position.
   * @return the center position of the given dimensions.
   */
  private centerPos(dim: WorldPoint): WorldPoint {
    return new WorldPoint(Math.floor(dim.x / 2), Math.floor(dim.y / 2));
  }

  /**
   * Creates a new player Mob.
   *
   * @return A new player Mob.
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
   * @return The created MobAI instance, or null if unable to create one.
   */
  public makeAI(): MobAI | null {
    return new AISwitcher(MoodAI.stockMoodShootAI(1, 8));
  }

  /**
   * Generates a ring of mobs around a central point on the map.
   *
   * @param glyph - The glyph representing the mob
   * @param map - The map on which the mobs will be generated
   * @param rand - The random generator for determining mob positions
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
   * @param glyph - The visual representation of the NPC.
   * @param x - The x-coordinate of the NPC on the map.
   * @param y - The y-coordinate of the NPC on the map.
   * @param map - The map to which the NPC is being added.
   * @param level - The level of the NPC.
   * @return The newly added NPC.
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
   * @param mob - The Mob whose statistics are being set.
   * @param mobLevel - The level of the Mob.
   */
  private setLevelStats(mob: Mob, mobLevel: number): void {
    mob.level = mobLevel;
    mob.maxhp = mobLevel * 5;
    mob.hp = mob.maxhp;
  }

  /**
   * Adds level stairs to the map based on the level and random generator provided.
   *
   * @param map - The map to which stairs are being added.
   * @param level - The level for which stairs are being added.
   * @param rand - The random generator used for adding stairs.
   */
  private addLevelStairs(
    map: GameMapType,
    level: number,
    rand: RandomGenerator,
  ): void {
    if (level === 0) {
      // For the first level, only place down stairs.
      this.addStair(map, rand, Glyph.Stairs_Down);
    } else {
      // For other levels, place both up and down stairs.
      this.addStair(map, rand, Glyph.Stairs_Down);
      this.addStair(map, rand, Glyph.Stairs_Up);
    }
  }

  /**
   * Adds a single staircase to the map, ensuring it's placed in a valid, free space.
   *
   * @param map - The map to which stairs are being added.
   * @param rand - The random generator used for placing stairs.
   * @param stairGlyph - The glyph representing the stairs (Up or Down).
   * @returns The position of the placed stairs, or null if no suitable position was found.
   */
  private addStair(
    map: GameMapType,
    rand: RandomGenerator,
    stairGlyph: Glyph.Stairs_Up | Glyph.Stairs_Down,
  ): WorldPoint | null {
    const maxAttempts = 100; // Prevent infinite loops on crowded maps.
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const p = FindFreeSpace.findFree(map, rand);
        map.cell(p).env = stairGlyph;
        map.addStairInfo(stairGlyph, p);
        return p;
      } catch (error) {
        console.warn(error);
      }
    }
    console.warn(`Could not place ${Glyph[stairGlyph]} on level ${map.level}.`);
    return null;
  }

  /**
   * Adds mobs to the level based on the map and random generator provided.
   *
   * @param map - The map to which mobs are being added.
   * @param rand - The random generator used for adding mobs.
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
   * Makes mobs on the map based on the provided map, random generator, and rate.
   *
   * @param map - The map on which the mobs will be created.
   * @param rand - The random generator used to determine the placement of the mobs.
   * @param rate - The rate of mob creation.
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
   *
   * @param pos - The position where the mob is added.
   * @param map - The map to which the mob is being added.
   * @param rand - The random generator used for adjusting the level.
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
   * @param level - The level number.
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
   * @param map - The map to which the mob is being added.
   * @param rand - The random generator used for adjusting the level.
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
   * @param game - The game object.
   */
  private initLevel0(game: Game): void {
    const L0 = game.dungeon.getMapForLevel(0, game);
    this.addItemToPlayerInventory(<Inventory>game.inventory);
    this.addItemNextToPlayer(game.player, L0);
    this.makeTestMob(L0, game.player);
  }

  /**
   * Adds items next to the player on the map.
   *
   * @param player - The player object.
   * @param map - The map where items are added.
   */
  private addItemNextToPlayer(player: Mob, map: GameMapType): void {
    const a = player.pos;
    let p = new WorldPoint(a.x, a.y + 2);
    map.addObject(
      new ItemObject(Glyph.Lantern, Slot.OffHand, [ObjCategory.Misc], 1, 2),
      p,
    );
    map.cell(p).env = Glyph.Regular_Floor;

    p = new WorldPoint(a.x, a.y + 1);
    const dynamite = new ItemObject(Glyph.Dynamite, Slot.NotWorn, [
      ObjCategory.Consumable,
    ]);
    dynamite.spellCasting.spell = Spell.Burn;
    dynamite.weight = 1.2;
    map.addObject(dynamite, p);
    map.cell(p).env = Glyph.Regular_Floor;
  }

  /**
   * Adds items to the player's inventory.
   *
   * @param inv - The inventory to add the item to.
   */
  private addItemToPlayerInventory(inv: Inventory): void {
    const pickaxe = new ItemObject(Glyph.Pickaxe, Slot.MainHand, [
      ObjCategory.MeleeWeapon,
    ]);
    pickaxe.weight = 1;
    inv.add(pickaxe);

    const firstAidKit = new ItemObject(Glyph.FirstAidKit, Slot.NotWorn, [
      ObjCategory.Consumable,
      ObjCategory.Special,
    ]);
    firstAidKit.spellCasting.spell = Spell.Heal;
    firstAidKit.weight = 1;
    inv.add(firstAidKit);

    const dynamite = new ItemObject(Glyph.Dynamite, Slot.NotWorn, [
      ObjCategory.Consumable,
      ObjCategory.Special,
    ]);
    dynamite.spellCasting.spell = Spell.Burn;
    dynamite.spellCasting.charges = 2;
    dynamite.weight = 1;
    inv.add(dynamite);

    const flareGun = new ItemObject(Glyph.FlareGun, Slot.NotWorn, [
      ObjCategory.RangedWeapon,
      ObjCategory.Special,
    ]);
    flareGun.spellCasting.spell = Spell.Burn;
    flareGun.spellCasting.charges = 1;
    flareGun.weight = 1;
    inv.add(flareGun);

    const revolver = new ItemObject(Glyph.Revolver, Slot.NotWorn, [
      ObjCategory.RangedWeapon,
      ObjCategory.Special,
    ]);
    revolver.spellCasting.spell = Spell.Bullet;
    revolver.spellCasting.charges = 10;
    revolver.weight = 1;
    inv.add(revolver);

    const strongPickaxe = new ItemObject(Glyph.Pickaxe, Slot.MainHand, [
      ObjCategory.MeleeWeapon,
    ]);
    strongPickaxe.level = 50;
    strongPickaxe.weight = 30;
    inv.add(strongPickaxe);

    const strongRevolver = new ItemObject(
      Glyph.Revolver,
      Slot.NotWorn,
      [ObjCategory.RangedWeapon, ObjCategory.Special],
      50, // level
    );
    strongRevolver.spellCasting.spell = Spell.Bullet;
    strongRevolver.spellCasting.charges = 10;
    strongRevolver.weight = 10;
    inv.add(strongRevolver);

    const ration = new ItemObject(Glyph.Ration, Slot.NotWorn, [
      ObjCategory.Consumable,
    ]);
    ration.spellCasting.spell = Spell.DecreaseHunger;
    ration.spellCasting.effectMagnitude = 0.25;
    ration.weight = 1;
    inv.add(ration);

    const waterBottle = new ItemObject(Glyph.Water_Bottle, Slot.NotWorn, [
      ObjCategory.Consumable,
    ]);
    waterBottle.spellCasting.spell = Spell.DecreaseThirst;
    waterBottle.spellCasting.effectMagnitude = 0.25;
    waterBottle.weight = 1;
    inv.add(waterBottle);

    for (let index = 0; index < 10; index++) {
      const leather = new ItemObject(
        Glyph.ToughLeather,
        Slot.NotWorn,
        [ObjCategory.Misc],
        1,
      );
      leather.spellCasting.description = 'some leather';
      leather.weight = 0.1;

      inv.add(leather);
    }

    for (let index = 0; index < 10; index++) {
      const fungus = new ItemObject(
        Glyph.BioluminescentFungus,
        Slot.NotWorn,
        [ObjCategory.Misc],
        1,
      );
      fungus.spellCasting.description = 'some bioluminescent fungus';
      fungus.weight = 0.1;

      inv.add(fungus);
    }

    for (let index = 0; index < 10; index++) {
      const laudanum = new ItemObject(
        Glyph.Laudanum,
        Slot.NotWorn,
        [ObjCategory.Consumable],
        1,
      );
      laudanum.spellCasting.spell = Spell.Heal;
      laudanum.spellCasting.description = 'some laudanum';
      laudanum.weight = 0.1;

      inv.add(laudanum);
    }
  }
}
