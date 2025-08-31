import { GameMapType } from '../gameLogic/maps/mapModel/gameMapType';
import { GameState } from './gameState';
import { Glyph } from '../../gameLogic/glyphs/glyph';
import { Mob } from '../../gameLogic/mobs/mob';
import { MobAI } from '../gameLogic/mobs/mobAI';
import { RandomGenerator } from '../../randomGenerator/randomGenerator';
import { SerializedGameState } from '../utilities/saveStateHandler';
import { WorldPoint } from '../../maps/mapModel/worldPoint';

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
