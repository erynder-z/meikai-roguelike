import { DrawableTerminal } from './drawableTerminal';

export type InteractiveScreen = {
  name: string;
  drawScreen(term: DrawableTerminal): void;
  handleKeyDownEvent(event: KeyboardEvent): void;
  onTime(): boolean;
};
