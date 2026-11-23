import Ionicons from '@expo/vector-icons/Ionicons';
import { View } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getSpecialtyIcon } from '../../utils/specialtyIcons';

export function SpecialtyIcon({ specialty }: { specialty: string }) {
  const { colors, typography } = useAppTheme();
  const name = getSpecialtyIcon(specialty);

  if (!name) return null;

  return (
    <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Ionicons name={name} size={typography.body + 3} color={colors.primary} />
    </View>
  );
}
