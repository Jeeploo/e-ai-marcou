import { useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppointmentDetails } from '../../hooks/useAppointmentDetails';
import { getApiErrorMessage } from '../../services/api';
import { AppointmentStatusMessage } from '../components/AppointmentStatusMessage';
import { useAppointments } from '../../contexts/AppointmentsContext';
import {
  canCancelAppointment,
  getAppointmentDateLabel,
  getAppointmentPriceLabel,
  getAppointmentStatusLabel,
} from '../../controllers/appointmentController';
import type { RootStackParamList } from '../../navigation/types';
import { spacing } from '../../theme/spacing';
import { BookingDetailsLayout } from '../components/BookingDetailsLayout';
import { BookingSummary } from '../components/BookingSummary';
import { PrimaryButton } from '../components/PrimaryButton';

type AppointmentDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'AppointmentDetails'>;

export function AppointmentDetailsScreen({ navigation, route }: AppointmentDetailsScreenProps) {
  const styles = useThemedStyles(createStyles);
  const { appointmentId } = route.params;
  const { demoMode, cancelAppointment } = useAppointments();
  const { detail, retry } = useAppointmentDetails(appointmentId);
  const [showCancellation, setShowCancellation] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancellationError, setCancellationError] = useState<string | null>(null);
  const [cancelled, setCancelled] = useState(false);
  const cancellationLock = useRef(false);
  const dialogTitle = useRef<ComponentRef<typeof Text>>(null);
  const appointment = detail.status === 'ready' ? detail.appointment : null;

  function closeCancellation() {
    if (!cancellationLock.current) setShowCancellation(false);
  }

  async function confirmCancellation() {
    if (!appointment || cancellationLock.current) return;
    cancellationLock.current = true;
    setCancelling(true);
    setCancellationError(null);
    try {
      await cancelAppointment(appointment);
      setCancelled(true);
      setShowCancellation(false);
    } catch (error) {
      setCancellationError(`Não foi possível cancelar a consulta. ${getApiErrorMessage(error)}`);
    } finally {
      cancellationLock.current = false;
      setCancelling(false);
    }
  }

  function focusDialogTitle() {
    if (dialogTitle.current) AccessibilityInfo.sendAccessibilityEvent(dialogTitle.current, 'focus');
  }

  const canCancel = appointment ? canCancelAppointment(appointment) : false;

  return (
    <>
      <BookingDetailsLayout
        title="Detalhes da consulta"
        subtitle={demoMode ? 'Modo demonstração' : undefined}
      >
        {detail.status === 'loading' && <AppointmentStatusMessage loading message="Carregando os detalhes da consulta…" />}
        {detail.status === 'missing' && <AppointmentStatusMessage message="Consulta não encontrada." />}
        {detail.status === 'error' && (
          <>
            <AppointmentStatusMessage message={`Não foi possível carregar os detalhes. ${detail.message}`} />
            <PrimaryButton label="Tentar novamente" onPress={retry} />
          </>
        )}
        {cancelled && <AppointmentStatusMessage message="Consulta cancelada." />}
        {appointment && (
          <BookingSummary professional={appointment} rows={[
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
            onPress={() => {
              setCancellationError(null);
              setShowCancellation(true);
            }}
          />
        )}
      </BookingDetailsLayout>
      <Modal
        visible={showCancellation}
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
                {demoMode
                  ? 'O cancelamento será registrado nos dados de demonstração.'
                  : 'Este horário será cancelado e deixará de ficar reservado para você.'}
              </Text>
              {cancelling && <AppointmentStatusMessage loading message="Cancelando consulta…" />}
              {cancellationError && <AppointmentStatusMessage message={cancellationError} />}
              <PrimaryButton label="Manter consulta" variant="outline" disabled={cancelling} onPress={closeCancellation} />
              <PrimaryButton label="Confirmar cancelamento" destructive disabled={cancelling || !canCancel} onPress={confirmCancellation} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const createStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
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
