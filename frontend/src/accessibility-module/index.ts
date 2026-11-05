export { default as AccessibilityWidget } from './components/AccessibilityWidget';
export type { AccessibilityWidgetProps } from './components/AccessibilityWidget';
export { useAccessibilityStore, sanitizeA11yPreferences, serializeA11yPreferences, DEFAULT_STORAGE_KEY } from './store/useAccessibilityStore';
export type { A11yPreferences, A11yState, ProfileType, WidgetPosition } from './store/useAccessibilityStore';
export { useAccessibilityMotion } from './hooks/useAccessibilityMotion';
// VLibras é opt-in: importar './components/VLibrasWidget' separadamente.
