import { useAccessibility } from '../contexts/AccessibilityContext';
import { useWindowDimensions } from 'react-native';

function useDeviceCompactLayout() {
  const { width, fontScale } = useWindowDimensions();
  return width < 360 || fontScale >= 1.2;
}

export function useCompactLayout() {
  const deviceCompact = useDeviceCompactLayout();
  const { largeTextEnabled } = useAccessibility();
  return deviceCompact || largeTextEnabled;
}
