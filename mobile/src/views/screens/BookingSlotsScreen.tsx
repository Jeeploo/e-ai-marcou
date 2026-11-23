import { useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBookingSelection } from '../../controllers/bookingController';
import { useCompactLayout } from '../../hooks/useCompactLayout';
import { useBookingOptions } from '../../hooks/useBookingOptions';
import { AppointmentStatusMessage } from '../components/AppointmentStatusMessage';
import type { RootStackParamList } from '../../navigation/types';
import { ProfessionalIdentity } from '../components/ProfessionalIdentity';
import { spacing } from '../../theme/spacing';
import { BookingOptionButton } from '../components/BookingOptionButton';
import { PrimaryButton } from '../components/PrimaryButton';

type BookingSlotsScreenProps = NativeStackScreenProps<RootStackParamList, 'BookingSlots'>;

export function BookingSlotsScreen({ navigation, route }: BookingSlotsScreenProps) {
  const styles = useThemedStyles(createStyles);
  const compact = useCompactLayout();
  const { mode, reload } = route.params;
  const reschedule = mode === 'reschedule';
  const { options, loading, error, demo, retry, useDemo } = useBookingOptions(route.params);
  const [date, setDate] = useState<string | null>(null);
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const selectedDay = options?.days.find((day) => day.date === date);
  const selection = getBookingSelection({ ...route.params, demo }, options, date, scheduleId);

  useEffect(() => {
    setDate(null);
    setScheduleId(null);
  }, [reload, demo]);

  function selectDate(nextDate: string) {
    if (date === nextDate) return;
    setDate(nextDate);
    setScheduleId(null);
  }

  function reviewBooking() {
    if (selection) navigation.navigate('BookingReview', selection);
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.title}>
            {reschedule ? 'Escolha o novo horário' : 'Escolha seu horário'}
          </Text>
          <Text style={styles.body}>
            {reschedule ? 'Selecione uma nova data e horário para sua consulta.' : 'Selecione o melhor dia e horário para sua consulta.'}
          </Text>
          {demo && <Text style={styles.body}>Dados de demonstração</Text>}
        </View>
        {loading && <AppointmentStatusMessage loading message="Carregando horários…" />}
        {error && (
          <View style={styles.section}>
            <AppointmentStatusMessage message="Não foi possível carregar os horários." />
            <PrimaryButton label="Tentar novamente" onPress={retry} />
            {!demo && route.params.professional && (
              <PrimaryButton label="Usar dados de demonstração" variant="outline" onPress={useDemo} />
            )}
          </View>
        )}
        {!loading && !error && (!options || options.days.length === 0) && (
          <View style={styles.section}>
            <Text accessibilityRole="header" style={styles.heading}>Sem horários disponíveis</Text>
            <AppointmentStatusMessage message="Não encontramos horários disponíveis para este profissional." />
            <PrimaryButton label="Tentar novamente" onPress={retry} />
            <PrimaryButton label={reschedule ? 'Voltar às consultas' : 'Voltar à busca'} variant="outline" onPress={() => navigation.goBack()} />
          </View>
        )}
        {options && options.days.length > 0 && (
          <>
            <View style={styles.summary}>
              <ProfessionalIdentity
                professionalId={options.professional.id}
                photoUrl={options.professional.photoUrl}
                name={options.professional.name}
                specialty={options.professional.specialty}
              />
              <Text style={styles.body}>{options.professional.neighborhood}</Text>
            </View>

            <View style={styles.section}>
              <Text accessibilityRole="header" style={styles.heading}>Escolha o dia</Text>
              <View style={[styles.options, compact && styles.stackedOptions]}>
                {options.days.map(({ date: dayDate, weekday, month, day, label }) => (
                  <BookingOptionButton
                    key={dayDate}
                    label={String(day)}
                    detail={demo ? weekday : weekday + ' · ' + month}
                    accessibilityLabel={label}
                    compact={compact}
                    selected={date === dayDate}
                    onPress={() => selectDate(dayDate)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text accessibilityRole="header" style={styles.heading}>Escolha a hora</Text>
              {selectedDay ? (
                <View style={[styles.options, compact && styles.stackedOptions]}>
                  {selectedDay.slots.map(({ id, time }) => (
                    <BookingOptionButton
                      key={id}
                      label={time}
                      accessibilityLabel={time + ', disponível'}
                      compact={compact}
                      selected={scheduleId === id}
                      onPress={() => setScheduleId(id)}
                    />
                  ))}
                </View>
              ) : (
                <Text style={styles.body}>Selecione um dia para ver os horários disponíveis.</Text>
              )}
            </View>

            <View style={styles.summary}>
              <Text style={styles.body}>Valor da consulta</Text>
              <Text style={styles.heading}>{options.priceLabel}</Text>
            </View>

            <PrimaryButton label={reschedule ? 'Revisar remarcação' : 'Revisar agendamento'} disabled={!selection} onPress={reviewBooking} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: { gap: spacing.sm },
  title: { color: colors.textPrimary, fontSize: typography.greeting, fontWeight: '700' },
  heading: { color: colors.textPrimary, fontSize: typography.sectionTitle, fontWeight: '700' },
  body: { color: colors.textSecondary, fontSize: typography.body },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stackedOptions: { flexDirection: 'column', flexWrap: 'nowrap' },
  summary: {
    gap: spacing.xs,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
  },
});
