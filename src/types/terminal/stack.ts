import { StackScreen } from './stackScreen';

export type Stack = {
  pop(): void;
  push(screen: StackScreen): void;
  getCurrentScreen(): StackScreen;
  removeScreen(screen: StackScreen): void;
  removeAllScreens(): void;
};
