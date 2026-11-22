import { useAppTheme, useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppointments } from '../../contexts/AppointmentsContext';
import { canCancelAppointment, getMockRescheduleProfessional, listAppointments } from '../../controllers/appointmentController';
import type { AppointmentListCategory } from '../../models/AppointmentModel';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { spacing } from '../../theme/spacing';
import { AppointmentStatusMessage } from '../components/AppointmentStatusMessage';
import { PrimaryButton } from '../components/PrimaryButton';
import { AppointmentCard } from '../components/AppointmentCard';

type AppointmentsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Appointments'>,
  NativeStackScreenProps<RootStackParamList, 'MainTabs'>
>;

const tabs: { category: AppointmentListCategory; label: string }[] = [
  { category: 'upcoming', label: 'Próximas' },
  { category: 'past', label: 'Anteriores' },
];

export function AppointmentsScreen({ navigation }: AppointmentsScreenProps) {
  const styles = useThemedStyles(createStyles);
  const [category, setCategory] = useState<AppointmentListCategory>('upcoming');
  const { colors } = useAppTheme();
  const { appointments, loading, error, demoMode, refresh, useDemoData } = useAppointments();
  const isUpcoming = category === 'upcoming';

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.screen}>
      <FlatList
        data={listAppointments(appointments, category)}
        keyExtractor={({ id }) => id}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
        ListHeaderComponent={
          <View style={styles.heading}>
            <Text accessibilityRole="header" style={styles.title}>Minhas consultas</Text>
            <Text style={styles.body}>Paciente de demonstração</Text>
            {loading && <AppointmentStatusMessage loading message="Carregando suas consultas…" />}
            {error && (
              <View style={styles.notice}>
                <AppointmentStatusMessage message={`Não foi possível carregar suas consultas. ${error}`} />
                <PrimaryButton label="Tentar novamente" onPress={refresh} disabled={loading} />
                {!demoMode && <PrimaryButton label="Usar dados de demonstração" variant="outline" onPress={useDemoData} disabled={loading} />}
              </View>
            )}
            {demoMode && <Text style={styles.body}>Modo demonstração. Alterações valem apenas neste app.</Text>}
            {!demoMode && error && appointments.length > 0 && <Text style={styles.body}>Mostrando a última atualização.</Text>}
            <View accessibilityRole="tablist" style={styles.tabs}>
              {tabs.map(({ category: tabCategory, label }) => {
                const selected = category === tabCategory;
                return (
                  <Pressable
                    key={tabCategory}
                    accessibilityRole="tab"
                    accessibilityLabel={label}
                    accessibilityState={{ selected }}
                    onPress={() => setCategory(tabCategory)}
                    style={({ pressed }) => [
                      styles.tab,
                      selected && styles.selectedTab,
                      pressed && styles.pressedTab,
                    ]}
                  >
                    <Text style={[styles.tabLabel, selected && styles.selectedLabel]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            onDetails={() => navigation.navigate('AppointmentDetails', { appointmentId: item.id })}
            onReschedule={canCancelAppointment(item) ? () => navigation.navigate('BookingSlots', {
              professionalId: item.professionalId,
              demoProfessional: getMockRescheduleProfessional(item),
            }) : undefined}
          />
        )}
        ListEmptyComponent={
          (!loading && (!error || demoMode || appointments.length > 0)) ? <Text style={styles.body}>
            {isUpcoming ? 'Você não tem consultas marcadas.' : 'Seu histórico de consultas aparecerá aqui.'}
          </Text> : undefined
        }
      />
    </SafeAreaView>
  );
}

const createStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  heading: { gap: spacing.sm },
  notice: { gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: spacing.md },
  title: { color: colors.textPrimary, fontSize: typography.greeting, fontWeight: '700' },
  body: { color: colors.textSecondary, fontSize: typography.body },
  tabs: { flexDirection: 'row', marginTop: spacing.sm },
  tab: {
    flex: 1,
    minHeight: spacing.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderBottomWidth: 3,
    borderBottomColor: colors.border,
  },
  selectedTab: { borderBottomColor: colors.primary, backgroundColor: colors.secondary },
  pressedTab: { opacity: 0.8 },
  tabLabel: { color: colors.textSecondary, fontSize: typography.button, textAlign: 'center' },
  selectedLabel: { color: colors.primary, fontWeight: '700' },
});
