// images/index.ts

import { attackImages as attackImages_boyish } from './imageImports/boyish/attackImages';
import { hurtImages as hurtImages_boyish } from './imageImports/boyish/hurtImages';
import { movingImages as movingImages_boyish } from './imageImports/boyish/movingImages';
import { neutralImages as neutralImages_boyish } from './imageImports/boyish/neutralImages';
import { pistolImages as pistolImages_boyish } from './imageImports/boyish/pistolImages';
import { smileImages as smileImages_boyish } from './imageImports/boyish/smileImages';
import deathImages from './imageImports/deathImages';
import { attackImages as attackImages_girlish } from './imageImports/girlish/attackImages';
import { hurtImages as hurtImages_girlish } from './imageImports/girlish/hurtImages';
import { movingImages as movingImages_girlish } from './imageImports/girlish/movingImages';
import { neutralImages as neutralImages_girlish } from './imageImports/girlish/neutralImages';
import { pistolImages as pistolImages_girlish } from './imageImports/girlish/pistolImages';
import { smileImages as smileImages_girlish } from './imageImports/girlish/smileImages';
import {
  lvlTier00Images,
  lvlTier01Images,
  lvlTier02Images,
  lvlTier03Images,
  lvlTier04Images,
  lvlTier05Images,
  lvlTier06Images,
  lvlTier07Images,
  lvlTier08Images,
  lvlTier09Images,
} from './imageImports/levelImages';
import { boyishPortrait, girlishPortrait } from './imageImports/portraitImages';

const attackImages = {
  boyish: attackImages_boyish,
  girlish: attackImages_girlish,
};

const hurtImages = {
  boyish: hurtImages_boyish,
  girlish: hurtImages_girlish,
};

const movingImages = {
  boyish: movingImages_boyish,
  girlish: movingImages_girlish,
};

const neutralImages = {
  boyish: neutralImages_boyish,
  girlish: neutralImages_girlish,
};

const pistolImages = {
  boyish: pistolImages_boyish,
  girlish: pistolImages_girlish,
};

const smileImages = {
  boyish: smileImages_boyish,
  girlish: smileImages_girlish,
};

const levelImages = {
  lvlTier00Images,
  lvlTier01Images,
  lvlTier02Images,
  lvlTier03Images,
  lvlTier04Images,
  lvlTier05Images,
  lvlTier06Images,
  lvlTier07Images,
  lvlTier08Images,
  lvlTier09Images,
};

export const images = {
  attackImages,
  hurtImages,
  movingImages,
  neutralImages,
  pistolImages,
  smileImages,
  deathImages,
  levelImages,
  girlishPortrait,
  boyishPortrait,
};
