import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppointments } from '../../contexts/AppointmentsContext';
import {
  canCancelAppointment,
  findAppointmentById,
  getAppointmentDateLabel,
  getAppointmentPriceLabel,
  getAppointmentStatusLabel,
} from '../../controllers/appointmentController';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { BookingDetailsLayout } from '../components/BookingDetailsLayout';
import { BookingSummary } from '../components/BookingSummary';
import { PrimaryButton } from '../components/PrimaryButton';

type AppointmentDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'AppointmentDetails'>;

export function AppointmentDetailsScreen({ navigation, route }: AppointmentDetailsScreenProps) {
  const { appointmentId } = route.params;
  const { appointments, cancelAppointment } = useAppointments();
  const [showCancellation, setShowCancellation] = useState(false);
  const dialogTitle = useRef<ComponentRef<typeof Text>>(null);
  const appointment = findAppointmentById(appointments, appointmentId);

  function closeCancellation() {
    setShowCancellation(false);
  }

  function confirmCancellation() {
    cancelAppointment(appointmentId);
    closeCancellation();
  }

  function focusDialogTitle() {
    if (dialogTitle.current) AccessibilityInfo.sendAccessibilityEvent(dialogTitle.current, 'focus');
  }

  const canCancel = appointment ? canCancelAppointment(appointment) : false;

  return (
    <>
      <BookingDetailsLayout
        title={appointment ? 'Detalhes da consulta' : 'Consulta indisponível'}
        subtitle={appointment ? 'Confira as informações do seu atendimento.' : 'Volte para ver suas consultas.'}
      >
        {appointment && (
          <BookingSummary rows={[
            { label: 'Profissional', value: appointment.professionalName },
            { label: 'Especialidade', value: appointment.specialty },
            { label: 'Local', value: appointment.location },
            { label: 'Dia', value: getAppointmentDateLabel(appointment) },
            { label: 'Horário', value: appointment.time },
            { label: 'Valor', value: getAppointmentPriceLabel(appointment) },
            { label: 'Status', value: getAppointmentStatusLabel(appointment) },
          ]} />
        )}
        <PrimaryButton label="Voltar às consultas" variant="outline" onPress={() => navigation.goBack()} />
        {canCancel && (
          <PrimaryButton
            label="Cancelar consulta"
            variant="outline"
            destructive
            onPress={() => setShowCancellation(true)}
          />
        )}
      </BookingDetailsLayout>
      <Modal
        visible={showCancellation && canCancel}
        transparent
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={closeCancellation}
        onShow={focusDialogTitle}
      >
        <SafeAreaView style={styles.overlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View accessibilityViewIsModal style={styles.dialog}>
              <Text ref={dialogTitle} accessible accessibilityRole="header" style={styles.dialogTitle}>
                Cancelar esta consulta?
              </Text>
              <Text style={styles.dialogBody}>
                Este horário será cancelado e deixará de ficar reservado para você.
              </Text>
              <PrimaryButton label="Manter consulta" variant="outline" onPress={closeCancellation} />
              <PrimaryButton label="Confirmar cancelamento" destructive onPress={confirmCancellation} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.55)' },
  modalContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialog: {
    width: '100%',
    maxWidth: 460,
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  dialogTitle: { fontSize: typography.sectionTitle, fontWeight: '700', color: colors.textPrimary },
  dialogBody: { fontSize: typography.body, color: colors.textSecondary },
});
