import { Glyph } from '../../gameLogic/glyphs/glyph';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { WeightedFeatureConfig } from '../../shared-types/gameLogic/maps/helpers/weightedFeatures';
import { GameMapType } from '../../shared-types/gameLogic/maps/mapModel/gameMapType';
import { MapUtils } from '../helpers/mapUtils';
import { OVERWORLD_LEVEL_TILES } from '../mapGenerator/generationData/overworldLevelTiles';
import { RockGenerator } from '../mapGenerator/rockGenerator';
import { GameMap } from '../mapModel/gameMap';
import { WorldPoint } from '../mapModel/worldPoint';

const overworldFeatures: WeightedFeatureConfig[] = [
  {
    glyph: Glyph.Deep_Water,
    weight: 2,
    minSize: 300,
    maxSize: 600,
    iterations: 10,
  },
  {
    glyph: Glyph.Shallow_Water,
    weight: 5,
    minSize: 10,
    maxSize: 40,
    iterations: 8,
  },
  {
    glyph: Glyph.Lava,
    weight: 1,
    minSize: 5,
    maxSize: 25,
    iterations: 10,
  },
  {
    glyph: Glyph.Nebulous_Mist,
    weight: 3,
    minSize: 20,
    maxSize: 60,
    iterations: 12,
  },
];

export class Overworld {
  public static generate(rand: RandomGenerator, level: number): GameMapType {
    const mapDimensionsX = 64;
    const mapDimensionsY = 32;
    const dim = new WorldPoint(mapDimensionsX, mapDimensionsY);
    const gameMap = new GameMap(dim, Glyph.Wall, level);

    gameMap.forEachCell((_cell, p) => {
      const edge = !(
        p.x > 0 &&
        p.x < mapDimensionsX - 1 &&
        p.y > 0 &&
        p.y < mapDimensionsY - 1
      );
      const chance = rand.isOneIn(4);

      if (chance) {
        gameMap.cell(p).env = RockGenerator.getWallRockTypes(
          rand,
          OVERWORLD_LEVEL_TILES,
        );
      } else {
        gameMap.cell(p).env = RockGenerator.getFloorRockTypes(
          rand,
          OVERWORLD_LEVEL_TILES,
        );
      }
      if (edge) {
        gameMap.cell(p).env = Glyph.Rock;
      }
    });

    const numberOfFeaturesToGenerate = 15;

    MapUtils.generateRandomFeatures(
      numberOfFeaturesToGenerate,
      gameMap,
      rand,
      overworldFeatures,
      dim,
    );

    /*   const singleFeature = {
      glyph: Glyph.Lava,
      weight: 1,
      minSize: 5,
      maxSize: 25,
      iterations: 10,
    };

    MapUtils.generateSingleFeature(singleFeature, m, rand, dim); */

    MapUtils.applyTerrainModifier(
      gameMap,
      rand,
      dim,
      rand.randomIntegerInclusive(50, 150),
      3,
      10,
      5,
      Glyph.Regular_Floor,
      Glyph.Mossy_Floor,
    );

    MapUtils.applyStaticEffectsToCells(gameMap);

    return gameMap;
  }
}
