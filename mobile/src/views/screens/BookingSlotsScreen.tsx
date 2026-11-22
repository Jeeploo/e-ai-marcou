import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBookingOptions, isBookingSelectionComplete } from '../../controllers/bookingController';
import { useCompactLayout } from '../../hooks/useCompactLayout';
import type { BookingSelection } from '../../models/BookingModel';
import type { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { BookingOptionButton } from '../components/BookingOptionButton';
import { PrimaryButton } from '../components/PrimaryButton';

type BookingSlotsScreenProps = NativeStackScreenProps<RootStackParamList, 'BookingSlots'>;

export function BookingSlotsScreen({ navigation, route }: BookingSlotsScreenProps) {
  const { professionalId } = route.params;
  const compact = useCompactLayout();
  const [options] = useState(() => getBookingOptions(professionalId));
  const [selection, setSelection] = useState<BookingSelection>({ professionalId, date: null, time: null });
  const canReview = isBookingSelectionComplete(selection, options);

  function selectDate(date: string) {
    setSelection((current) => current.date === date ? current : { ...current, date, time: null });
  }

  function reviewBooking() {
    if (canReview) {
      navigation.navigate('BookingReview', { professionalId, date: selection.date, time: selection.time });
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.title}>Escolha seu horário</Text>
          <Text style={styles.body}>Selecione o melhor dia e horário para sua consulta.</Text>
        </View>
        {options ? (
          <>
            <View style={styles.summary}>
              <Text style={styles.heading}>{options.professional.name}</Text>
              <Text style={styles.body}>{options.professional.specialty} · {options.professional.neighborhood}</Text>
            </View>

            <View style={styles.section}>
              <Text accessibilityRole="header" style={styles.heading}>Escolha o dia</Text>
              <View style={[styles.options, compact && styles.stackedOptions]}>
                {options.dates.map(({ date, weekday, day, label }) => (
                  <BookingOptionButton
                    key={date}
                    label={String(day)}
                    detail={weekday}
                    accessibilityLabel={label}
                    compact={compact}
                    selected={selection.date === date}
                    onPress={() => selectDate(date)}
                  />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text accessibilityRole="header" style={styles.heading}>Escolha a hora</Text>
              {selection.date ? (
                <View style={[styles.options, compact && styles.stackedOptions]}>
                  {options.times.map(({ time }) => (
                    <BookingOptionButton
                      key={time}
                      label={time}
                      accessibilityLabel={time}
                      compact={compact}
                      selected={selection.time === time}
                      onPress={() => setSelection((current) => ({ ...current, time }))}
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

            <PrimaryButton label="Revisar agendamento" disabled={!canReview} onPress={reviewBooking} />
          </>
        ) : (
          <Text style={styles.body}>Profissional não encontrado. Volte à busca e selecione um profissional.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  options: { flexDirection: 'row', gap: spacing.sm },
  stackedOptions: { flexDirection: 'column' },
  summary: {
    gap: spacing.xs,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
  },
});
