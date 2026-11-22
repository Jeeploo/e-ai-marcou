import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type SpecialtyButtonProps = {
  label: string;
  onPress: () => void;
};

export function SpecialtyButton({ label, onPress }: SpecialtyButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexBasis: '46%',
    flexGrow: 1,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },
  label: { color: colors.primary, fontSize: typography.caption, fontWeight: '600' },
  pressed: { backgroundColor: colors.secondary },
});
