import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getBookingSummary } from '../../controllers/bookingController';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { BookingDetailsLayout } from '../components/BookingDetailsLayout';
import { BookingSummary } from '../components/BookingSummary';
import { PrimaryButton } from '../components/PrimaryButton';

type BookingConfirmationScreenProps = NativeStackScreenProps<RootStackParamList, 'BookingConfirmation'>;

export function BookingConfirmationScreen({ navigation, route }: BookingConfirmationScreenProps) {
  const summary = getBookingSummary(route.params);

  function openAppointments() {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs', params: { screen: 'Appointments', initial: false } }],
    });
  }

  return (
    <BookingDetailsLayout
      title={summary ? 'Consulta marcada!' : 'Consulta indisponível'}
      subtitle={summary ? 'Seu agendamento foi confirmado.' : 'Volte para conferir os dados da consulta.'}
    >
      {summary ? (
        <>
          <Ionicons name="checkmark-circle" size={56} color={colors.success} accessible={false} />
          <BookingSummary rows={[
            { label: 'Profissional', value: summary.professional.name },
            { label: 'Especialidade', value: summary.professional.specialty },
            { label: 'Data', value: summary.dateLabel },
            { label: 'Horário', value: summary.time },
          ]} />
          <PrimaryButton label="Ver minhas consultas" onPress={openAppointments} />
        </>
      ) : (
        <PrimaryButton label="Voltar à revisão" variant="outline" onPress={() => navigation.goBack()} />
      )}
    </BookingDetailsLayout>
  );
}
