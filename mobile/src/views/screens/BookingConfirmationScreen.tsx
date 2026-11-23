import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { formatBookingSummary } from '../../controllers/bookingController';
import type { RootStackParamList } from '../../navigation/types';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppointmentStatusMessage } from '../components/AppointmentStatusMessage';
import { BookingDetailsLayout } from '../components/BookingDetailsLayout';
import { BookingSummary } from '../components/BookingSummary';
import { PrimaryButton } from '../components/PrimaryButton';

type BookingConfirmationScreenProps = NativeStackScreenProps<RootStackParamList, 'BookingConfirmation'>;

export function BookingConfirmationScreen({ navigation, route }: BookingConfirmationScreenProps) {
  const { colors } = useAppTheme();
  const { mode, demo, appointment } = route.params;
  const summary = formatBookingSummary(appointment);
  const reschedule = mode === 'reschedule';
  const title = demo ? 'Simulação concluída' : reschedule ? 'Consulta remarcada!' : 'Consulta marcada!';

  function openAppointments() {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Appointments', initial: false } }],
    });
  }

  return (
    <BookingDetailsLayout title={title} subtitle={demo ? 'Dados de demonstração' : undefined}>
      <Ionicons name="checkmark-circle" size={56} color={colors.success} accessible={false} />
      <AppointmentStatusMessage message={demo
        ? (reschedule ? 'Sua consulta original continua marcada.' : 'Você simulou um agendamento.')
        : (reschedule ? 'Seu novo horário foi confirmado.' : 'Seu agendamento foi confirmado.')} />
      <BookingSummary professional={summary} rows={[
        { label: 'Data', value: summary.dateLabel },
        { label: 'Horário', value: summary.time },
      ]} />
      <PrimaryButton label="Ver minhas consultas" onPress={openAppointments} />
    </BookingDetailsLayout>
  );
}
