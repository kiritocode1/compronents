"use client";

export function useViewTransition() {
  const navigateWithTransition = (
    _href: string,
    onRouteChange?: (() => void) | null,
  ) => onRouteChange?.();

  return { navigateWithTransition };
}
