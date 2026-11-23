import { useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import { Pressable, StyleSheet, Text } from 'react-native';
import { SpecialtyIcon } from './SpecialtyIcon';
import { spacing } from '../../theme/spacing';

type SpecialtyButtonProps = {
  label: string;
  onPress: () => void;
};

export function SpecialtyButton({ label, onPress }: SpecialtyButtonProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <SpecialtyIcon specialty={label} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const createStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
  button: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  label: { flexShrink: 1, color: colors.primary, fontSize: typography.caption, fontWeight: '600' },
  pressed: { backgroundColor: colors.secondary },
});
