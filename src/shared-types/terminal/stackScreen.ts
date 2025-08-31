import { DrawableTerminal } from './drawableTerminal';
import { Stack } from './stack';

export type StackScreen = {
  name: string;
  drawScreen(term: DrawableTerminal): void;
  handleKeyDownEvent(event: KeyboardEvent, stack: Stack): void;
  onTime(stack: Stack): boolean;
};
