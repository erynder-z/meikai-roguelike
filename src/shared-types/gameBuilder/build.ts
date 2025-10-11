import { Glyph } from '../../gameLogic/glyphs/glyph';
import { Mob } from '../../gameLogic/mobs/mob';
import { WorldPoint } from '../../maps/mapModel/worldPoint';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { GameMapType } from '../gameLogic/maps/mapModel/gameMapType';
import { MobAI } from '../gameLogic/mobs/mobAI';
import { SerializedGameState } from '../utilities/saveStateHandler';
import { GameState } from './gameState';

export type Build = {
  makeGame(): GameState;
  restoreGame(saveState: SerializedGameState): GameState;
  makeLevel(
    rand: RandomGenerator,
    level: number,
    surfaceTemp: number,
  ): GameMapType;
  makeMap(
    rand: RandomGenerator,
    level: number,
    surfaceTemp: number,
  ): GameMapType;
  makePlayer(): Mob;
  makeAI(): MobAI | null;
  addNPC(
    glyph: Glyph,
    x: number,
    y: number,
    map: GameMapType,
    level: number,
  ): Mob;
  addMapLevel_Mob(
    pos: WorldPoint,
    map: GameMapType,
    rand: RandomGenerator,
  ): void;
};
