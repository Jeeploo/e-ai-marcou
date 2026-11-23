import { usePreventRemove } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState } from 'react';
import { useAppointments } from '../../contexts/AppointmentsContext';
import { confirmBooking, getBookingError, getReviewSummary } from '../../controllers/bookingController';
import type { BookingConfirmation } from '../../models/BookingModel';
import type { RootStackParamList } from '../../navigation/types';
import { AppointmentStatusMessage } from '../components/AppointmentStatusMessage';
import { BookingDetailsLayout } from '../components/BookingDetailsLayout';
import { BookingSummary } from '../components/BookingSummary';
import { PrimaryButton } from '../components/PrimaryButton';

type BookingReviewScreenProps = NativeStackScreenProps<RootStackParamList, 'BookingReview'>;

export function BookingReviewScreen({ navigation, route }: BookingReviewScreenProps) {
  const selection = route.params;
  const reschedule = selection.mode === 'reschedule';
  const summary = getReviewSummary(selection);
  const { refresh } = useAppointments();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<ReturnType<typeof getBookingError> | null>(null);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const submitLock = useRef(false);

  usePreventRemove(sending, () => {});

  useEffect(() => {
    if (confirmation) navigation.replace('BookingConfirmation', confirmation);
  }, [confirmation, navigation]);

  async function submit() {
    if (submitLock.current || confirmation || error?.chooseAnother) return;
    submitLock.current = true;
    setSending(true);
    setError(null);
    try {
      const result = await confirmBooking(selection);
      if (!result.demo) void refresh(result.appointment);
      setConfirmation(result);
    } catch (error) {
      submitLock.current = false;
      setError(getBookingError(error, selection.mode));
    } finally {
      setSending(false);
    }
  }

  function backToSlots() {
    if (error?.chooseAnother) {
      const { professionalId, professional, demo } = selection;
      const intent = selection.mode === 'reschedule'
        ? { mode: selection.mode, appointmentId: selection.appointmentId }
        : { mode: selection.mode };
      navigation.popTo('BookingSlots', { ...intent, professionalId, professional, demo, reload: Date.now() });
    } else {
      navigation.goBack();
    }
  }

  return (
    <BookingDetailsLayout
      title={reschedule ? 'Revise a remarcação' : 'Revise sua consulta'}
      subtitle={selection.demo ? 'Dados de demonstração' : 'Confira os dados antes de confirmar.'}
    >
      <BookingSummary professional={summary} rows={[
        { label: 'Local', value: summary.location },
        { label: 'Dia', value: summary.dateLabel },
        { label: 'Horário', value: summary.time },
        { label: 'Valor', value: summary.priceLabel },
      ]} />
      {sending && <AppointmentStatusMessage loading message="Confirmando…" />}
      {error && <AppointmentStatusMessage message={error.message} />}
      <PrimaryButton
        label={error?.chooseAnother ? 'Escolher outro horário' : 'Voltar aos horários'}
        variant="outline"
        disabled={sending || Boolean(confirmation)}
        onPress={backToSlots}
      />
      {!error?.chooseAnother && (
        <PrimaryButton
          label={reschedule ? 'Confirmar remarcação' : 'Confirmar agendamento'}
          disabled={sending || Boolean(confirmation)}
          onPress={submit}
        />
      )}
    </BookingDetailsLayout>
  );
}
