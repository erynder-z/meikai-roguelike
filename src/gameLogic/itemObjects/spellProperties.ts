import { Spell } from '../spells/spell';

export class SpellProperties {
  constructor(
    public spell: Spell = Spell.None,
    public description: string = 'some spell',
    public charges: number = 1,
    public effectMagnitude: number | null = null,
  ) {}
}
