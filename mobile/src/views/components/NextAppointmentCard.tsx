import type { ReactNode } from 'react';
import { useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import { StyleSheet, Text, View } from 'react-native';
import { getAppointmentDateLabel, getAppointmentStatusLabel } from '../../controllers/appointmentController';
import type { Appointment } from '../../models/AppointmentModel';
import { ProfessionalIdentity } from './ProfessionalIdentity';
import { spacing } from '../../theme/spacing';

export function NextAppointmentCard({ appointment, children }: { appointment?: Appointment; children: ReactNode }) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.heading}>Sua próxima visita</Text>
      {appointment ? (
        <>
          <ProfessionalIdentity
            professionalId={appointment.professionalId}
            photoUrl={appointment.photoUrl}
            name={appointment.professionalName}
            specialty={appointment.specialty}
          />
          <Text style={styles.date}>{getAppointmentDateLabel(appointment)} às {appointment.time}</Text>
          <Text style={styles.status}>{getAppointmentStatusLabel(appointment)}</Text>
        </>
      ) : children}
    </View>
  );
}

const createStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
  card: {
    minWidth: 0,
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  heading: {
    color: colors.primary,
    fontSize: typography.appointmentTitle,
    fontWeight: '600',
  },
  date: {
    color: colors.textSecondary,
    fontSize: typography.body,
  },
  status: {
    maxWidth: '100%',
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary,
    color: colors.success,
    fontSize: typography.caption,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
});
