import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  destructive?: boolean;
  variant?: 'filled' | 'outline';
};

export function PrimaryButton({
  label,
  onPress,
  variant = 'filled',
  disabled = false,
  destructive = false,
}: PrimaryButtonProps) {
  const outlined = variant === 'outline';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        outlined && styles.outline,
        destructive && (outlined ? styles.destructiveOutline : styles.destructive),
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[
        styles.label,
        outlined && styles.outlineLabel,
        outlined && destructive && styles.destructiveLabel,
        disabled && styles.disabledLabel,
      ]}>
        {label}
      </Text>
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
  destructive: { borderColor: colors.accent, backgroundColor: colors.accent },
  destructiveOutline: { borderColor: colors.accent },
  destructiveLabel: { color: colors.accent },
  disabled: { backgroundColor: colors.secondary, borderColor: colors.border },
  disabledLabel: { color: colors.textSecondary },
  pressed: { opacity: 0.8 },
});
