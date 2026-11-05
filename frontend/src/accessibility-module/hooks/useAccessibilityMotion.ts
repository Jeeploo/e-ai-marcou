'use client';

import { useSyncExternalStore } from 'react';
import { useAccessibilityStore } from '../store/useAccessibilityStore';

const query = '(prefers-reduced-motion: reduce)';
const subscribe = (listener: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener('change', listener);
  return () => media.removeEventListener('change', listener);
};
const snapshot = () => window.matchMedia(query).matches;

/** Para temporizadores, WebGL, carrosséis e outras animações JavaScript do app. */
export function useAccessibilityMotion() {
  const native = useSyncExternalStore(subscribe, snapshot, () => false);
  const reduce = useAccessibilityStore(state => state.reduceMotion);
  const pause = useAccessibilityStore(state => state.pauseAnimations);
  return { reduceMotion: native || reduce, pauseAnimations: native || reduce || pause };
}
