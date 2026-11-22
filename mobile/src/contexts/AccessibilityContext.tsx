import { createContext, useContext, useState, type PropsWithChildren } from 'react';

type AccessibilityPreferences = {
  largeTextEnabled: boolean;
  highContrastEnabled: boolean;
  setLargeTextEnabled: (enabled: boolean) => void;
  setHighContrastEnabled: (enabled: boolean) => void;
};

const AccessibilityContext = createContext<AccessibilityPreferences | null>(null);

export function AccessibilityProvider({ children }: PropsWithChildren) {
  const [largeTextEnabled, setLargeTextEnabled] = useState(false);
  const [highContrastEnabled, setHighContrastEnabled] = useState(false);

  return (
    <AccessibilityContext.Provider value={{
      largeTextEnabled, highContrastEnabled, setLargeTextEnabled, setHighContrastEnabled,
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) throw new Error('useAccessibility requires AccessibilityProvider');
  return context;
}
