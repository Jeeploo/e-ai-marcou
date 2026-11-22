import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type BookingOptionButtonProps = {
  label: string;
  accessibilityLabel: string;
  detail?: string;
  selected: boolean;
  compact: boolean;
  onPress: () => void;
};

export function BookingOptionButton({
  label,
  accessibilityLabel,
  detail,
  selected,
  compact,
  onPress,
}: BookingOptionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        !compact && styles.column,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      {detail && <Text style={styles.detail}>{detail}</Text>}
      <Text style={styles.label}>{label.replace(':', ':\u2060')}</Text>
      {selected && <Ionicons name="checkmark" size={20} color={colors.primary} accessible={false} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minWidth: 0,
    minHeight: spacing.touchTarget,
    gap: spacing.xs,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
  },
  column: { flex: 1 },
  selected: { borderColor: colors.primary, backgroundColor: colors.secondary },
  pressed: { backgroundColor: colors.secondary },
  detail: { color: colors.textSecondary, fontSize: typography.body, textTransform: 'capitalize' },
  label: { color: colors.primary, fontSize: typography.appointmentTitle, fontWeight: '700' },
});
