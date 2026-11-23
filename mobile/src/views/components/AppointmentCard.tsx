import { useAppTheme, useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { getAppointmentDateLabel, getAppointmentStatusLabel } from '../../controllers/appointmentController';
import { useCompactLayout } from '../../hooks/useCompactLayout';
import type { Appointment } from '../../models/AppointmentModel';
import { ProfessionalIdentity } from './ProfessionalIdentity';
import { spacing } from '../../theme/spacing';
import { PrimaryButton } from './PrimaryButton';

type AppointmentCardProps = {
  appointment: Appointment;
  onDetails: () => void;
  onReschedule?: () => void;
};

export function AppointmentCard({ appointment, onDetails, onReschedule }: AppointmentCardProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useAppTheme();
  const compact = useCompactLayout();

  return (
    <View style={styles.card}>
      <ProfessionalIdentity professionalId={appointment.professionalId} photoUrl={appointment.photoUrl} name={appointment.professionalName} specialty={appointment.specialty} heading />
      <View style={styles.schedule}>
        <Ionicons name="calendar-outline" size={20} color={colors.primary} accessible={false} />
        <Text style={[styles.body, styles.date]}>{getAppointmentDateLabel(appointment)} às {appointment.time}</Text>
      </View>
      <Text style={styles.status}>{getAppointmentStatusLabel(appointment)}</Text>
      <View style={[styles.actions, !compact && onReschedule && styles.actionsRow]}>
        <View style={!compact && onReschedule ? styles.actionColumn : undefined}>
          <PrimaryButton label="Detalhes" onPress={onDetails} />
        </View>
        {onReschedule && (
          <View style={!compact ? styles.actionColumn : undefined}>
            <PrimaryButton label="Remarcar" variant="outline" onPress={onReschedule} />
          </View>
        )}
      </View>
    </View>
  );
}

const createStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
  card: {
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  body: { fontSize: typography.body, color: colors.textSecondary },
  schedule: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  date: { flex: 1 },
  status: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.secondary,
    color: colors.primary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  actions: { gap: spacing.sm },
  actionsRow: { flexDirection: 'row' },
  actionColumn: { flex: 1, minWidth: 0 },
});
