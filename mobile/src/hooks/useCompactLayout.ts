import { useWindowDimensions } from 'react-native';

export function useCompactLayout() {
  const { width, fontScale } = useWindowDimensions();
  return width < 360 || fontScale >= 1.2;
}
