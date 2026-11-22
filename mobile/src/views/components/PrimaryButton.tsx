import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'filled' | 'outline';
};

export function PrimaryButton({ label, onPress, variant = 'filled' }: PrimaryButtonProps) {
  const outlined = variant === 'outline';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        outlined && styles.outline,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, outlined && styles.outlineLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    minHeight: 51,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 11,
    backgroundColor: colors.primary,
  },
  outline: { minHeight: 50, backgroundColor: colors.surface },
  label: {
    color: colors.surface,
    fontSize: typography.button,
    fontWeight: '600',
    textAlign: 'center',
  },
  outlineLabel: { color: colors.primary },
  pressed: { opacity: 0.8 },
});
