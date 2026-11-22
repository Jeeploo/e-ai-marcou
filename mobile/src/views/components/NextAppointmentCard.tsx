import { StyleSheet, Text, View } from 'react-native';
import type { NextAppointment } from '../../models/HomeModel';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export function NextAppointmentCard({ appointment }: { appointment: NextAppointment }) {
  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.heading}>Sua próxima visita</Text>
      <View style={styles.details}>
        <Text style={styles.name}>{appointment.professionalName}</Text>
        <Text style={styles.specialty}>{appointment.specialty}</Text>
      </View>
      <Text style={styles.status}>{appointment.statusText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  details: { gap: spacing.xs },
  name: { color: colors.textPrimary, fontSize: typography.professionalName, fontWeight: '600' },
  specialty: { color: colors.textSecondary, fontSize: typography.caption },
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
