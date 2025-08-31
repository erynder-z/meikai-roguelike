import { TerminalPoint } from '../../terminal/terminalPoint';

export type DrawableTerminal = {
  dimensions: TerminalPoint;
  drawText(
    x: number,
    y: number,
    char: string,
    fgCol: string,
    bgCol: string,
  ): void;
  drawAt(x: number, y: number, str: string, fgCol: string, bgCol: string): void;

  drawOverlayCursor(
    x: number,
    y: number,
    color: string,
    opacityFactor: number,
    borderColor: string,
    borderThickness: number,
    cornerSize: number,
  ): void;

  drawBurstAttackOverlay(
    x: number,
    y: number,
    color: string,
    opacityFactor: number,
    thickness: number,
  ): void;

  drawLongerSlashAttackOverlay(
    x: number,
    y: number,
    color: string,
    opacityFactor: number,
    thickness: number,
  ): void;

  drawShorterSlashAttackOverlay(
    x: number,
    y: number,
    color: string,
    opacityFactor: number,
    thickness: number,
  ): void;

  drawSlashOverlay(
    x: number,
    y: number,
    color: string,
    opacityFactor: number,
    thickness: number,
    minFactor: number,
    factorRange: number,
  ): void;

  drawProjectileExplosion(
    x: number,
    y: number,
    explosionColor: string,
    opacityFactor: number,
    thickness: number,
  ): void;

  setShadow(
    color: string,
    blur: number,
    offsetX: number,
    offsetY: number,
  ): void;

  clearShadow(): void;
};
