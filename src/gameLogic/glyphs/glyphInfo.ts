/**
 * Represents information about a glyph.
 */
export class GlyphInfo {
  constructor(
    public id: string,
    public fgCol: string,
    public bgCol: string,
    public hasSolidBg: boolean,
    public char: string,
    public name: string,
    public description: string,
    public isOpaque: boolean = false,
    public isBlockingMovement: boolean = false,
    public isBlockingProjectiles: boolean = false,
    public isDiggable: boolean = false,
    public isCausingSlow: boolean = false,
    public isCausingBurn: boolean = false,
    public isMagnetic: boolean = false,
    public isCausingBleed: boolean = false,
    public isGlowing: boolean = false,
    public isCausingPoison: boolean = false,
    public isCausingConfusion: boolean = false,
    public isCausingBlind: boolean = false,
    public defaultBuffDuration: number = 0,
    public help?: { show: boolean; about: string },
  ) {}
}
