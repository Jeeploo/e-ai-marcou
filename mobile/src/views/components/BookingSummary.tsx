import { useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import { StyleSheet, Text, View } from 'react-native';
import { useCompactLayout } from '../../hooks/useCompactLayout';
import type { Appointment } from '../../models/AppointmentModel';
import { ProfessionalIdentity } from './ProfessionalIdentity';
import { spacing } from '../../theme/spacing';

type BookingSummaryProps = {
  professional: Pick<Appointment, 'professionalId' | 'professionalName' | 'photoUrl' | 'specialty'>;
  rows: readonly { label: string; value: string }[];
};

export function BookingSummary({ professional, rows }: BookingSummaryProps) {
  const styles = useThemedStyles(createStyles);
  const compact = useCompactLayout();

  return (
    <View style={styles.card}>
      <ProfessionalIdentity professionalId={professional.professionalId} photoUrl={professional.photoUrl} name={professional.professionalName} specialty={professional.specialty} />
      {rows.map(({ label, value }) => (
        <View
          key={label}
          accessible
          accessibilityLabel={`${label}: ${value}`}
          style={[styles.row, compact && styles.stackedRow]}
        >
          <Text style={[styles.label, !compact && styles.labelColumn]}>{label}</Text>
          <Text style={[styles.value, !compact && styles.valueColumn]}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const createStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
  },
  row: { flexDirection: 'row', gap: spacing.md },
  stackedRow: { flexDirection: 'column', gap: spacing.xs },
  label: { minWidth: 0, flexShrink: 1, color: colors.textSecondary, fontSize: typography.body },
  labelColumn: { width: '40%' },
  value: { minWidth: 0, flexShrink: 1, color: colors.textPrimary, fontSize: typography.body, fontWeight: '600' },
  valueColumn: { flex: 1 },
});
