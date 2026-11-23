import { useAppTheme, useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text } from 'react-native';
import { spacing } from '../../theme/spacing';

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
  const styles = useThemedStyles(createStyles);
  const { colors } = useAppTheme();
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

const createStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
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
  column: { flexBasis: '30%', flexGrow: 1 },
  selected: { borderColor: colors.primary, backgroundColor: colors.secondary },
  pressed: { backgroundColor: colors.secondary },
  detail: { color: colors.textSecondary, fontSize: typography.body, textTransform: 'capitalize' },
  label: { color: colors.primary, fontSize: typography.appointmentTitle, fontWeight: '700' },
});
