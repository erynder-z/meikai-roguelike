/**
 * Handles global keydown events, preventing default behavior for the Escape and Meta key. This is intended to prevent exiting fullscreen mode when pressing Esc on macOS.
 *
 * @param event - The keyboard event to handle.
 */
export const handleGlobalKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' || event?.metaKey) event.preventDefault();
};
