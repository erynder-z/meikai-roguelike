// Spells should be arranged in order of their power. Sorting should be done from weak to strong.
export enum Spell {
  // Combat Spells
  Heal, // Tier 1
  Charm, // Tier 2
  Slow, // Tier 3
  Afraid, // Tier 4
  Bullet, // Tier 5
  Poison, // Tier 6
  Confuse, // Tier 7
  Silence, // Tier 8
  Cleanse, // Tier 9
  Stun, // Tier 10
  Burn, // Tier 11
  Blind, // Tier 12
  Multiply, // Tier 13
  Freeze, // Tier 14
  Root, // Tier 15
  Shock, // Tier 16
  Teleport, // Tier 17
  Paralyze, // Tier 18
  Sleep, // Tier 19
  Petrify, // Tier 20
  Summon, // Tier 21
  Bleed, // Tier 22
  Levitate, // Tier 23
  Disarm, // Tier 24
  None, // Tier 25

  // Utility spells for hunger and thirst
  DecreaseHunger,
  DecreaseThirst,
}

export const PICKABLE_SPELLS: readonly Spell[] = [
  Spell.Heal,
  Spell.Charm,
  Spell.Slow,
  Spell.Afraid,
  Spell.Bullet,
  Spell.Poison,
  Spell.Confuse,
  Spell.Silence,
  Spell.Cleanse,
  Spell.Stun,
  Spell.Burn,
  Spell.Blind,
  Spell.Multiply,
  Spell.Freeze,
  Spell.Root,
  Spell.Shock,
  Spell.Teleport,
  Spell.Paralyze,
  Spell.Sleep,
  Spell.Petrify,
  Spell.Summon,
  Spell.Bleed,
  Spell.Levitate,
  Spell.Disarm,
];
