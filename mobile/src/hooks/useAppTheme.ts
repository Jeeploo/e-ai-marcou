import { useMemo } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { colors, highContrastColors, type AppColors } from '../theme/colors';
import { typography, largeTypography, type AppTypography } from '../theme/typography';

export type AppTheme = { colors: AppColors; typography: AppTypography };

export function useAppTheme(): AppTheme {
  const { highContrastEnabled, largeTextEnabled } = useAccessibility();
  return {
    colors: highContrastEnabled ? highContrastColors : colors,
    typography: largeTextEnabled ? largeTypography : typography,
  };
}

export function useThemedStyles<T>(createStyles: (theme: AppTheme) => T) {
  const { colors, typography } = useAppTheme();
  return useMemo(() => createStyles({ colors, typography }), [createStyles, colors, typography]);
}
