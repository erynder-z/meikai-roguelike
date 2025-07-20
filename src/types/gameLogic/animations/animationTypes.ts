export type AttackAnimationType =
  | 'longerSlash'
  | 'shorterSlash'
  | 'burst'
  | 'ranged';

export type AttackAnimation = {
  type: AttackAnimationType;
  color: string;
  opacityFactor: number;
  thickness: number;
};
