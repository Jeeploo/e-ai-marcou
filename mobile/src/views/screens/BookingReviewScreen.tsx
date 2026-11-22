import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { getBookingSummary } from '../../controllers/bookingController';
import type { RootStackParamList } from '../../navigation/types';
import { BookingDetailsLayout } from '../components/BookingDetailsLayout';
import { BookingSummary } from '../components/BookingSummary';
import { PrimaryButton } from '../components/PrimaryButton';

type BookingReviewScreenProps = NativeStackScreenProps<RootStackParamList, 'BookingReview'>;

export function BookingReviewScreen({ navigation, route }: BookingReviewScreenProps) {
  const summary = getBookingSummary(route.params);

  return (
    <BookingDetailsLayout
      title="Revise sua consulta"
      subtitle={summary ? 'Confira os dados antes de confirmar.' : 'Selecione um dia e horário para continuar.'}
    >
      {summary && (
        <BookingSummary rows={[
          { label: 'Profissional', value: summary.professional.name },
          { label: 'Especialidade', value: summary.professional.specialty },
          { label: 'Local', value: summary.professional.neighborhood },
          { label: 'Dia', value: summary.dateLabel },
          { label: 'Horário', value: summary.time },
          { label: 'Valor', value: summary.priceLabel },
        ]} />
      )}
      <PrimaryButton label="Voltar aos horários" variant="outline" onPress={() => navigation.goBack()} />
      {summary && (
        <PrimaryButton
          label="Confirmar agendamento"
          onPress={() => navigation.navigate('BookingConfirmation', route.params)}
        />
      )}
    </BookingDetailsLayout>
  );
}
