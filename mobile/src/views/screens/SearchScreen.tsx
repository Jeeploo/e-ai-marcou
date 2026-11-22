import { useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCompactLayout } from '../../hooks/useCompactLayout';
import { getHomeData } from '../../controllers/homeController';
import {
  clearSearchFilters,
  searchProfessionals,
  validateSearchFilters,
} from '../../controllers/searchController';
import {
  locationReferences,
  type LocationReference,
  type SearchFilters,
} from '../../models/SearchModel';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';
import { spacing } from '../../theme/spacing';
import { AppHeader } from '../components/AppHeader';
import { EmptySearchState } from '../components/EmptySearchState';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProfessionalCard } from '../components/ProfessionalCard';
import { SearchField } from '../components/SearchField';
import { SearchFiltersModal } from '../components/SearchFiltersModal';

const patientName = getHomeData().patientName;

type SearchScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, 'Search'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function SearchScreen({ navigation }: SearchScreenProps) {
  const styles = useThemedStyles(createStyles);
  const compact = useCompactLayout();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(clearSearchFilters);
  const [draft, setDraft] = useState(clearSearchFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationReference>('Minha localização');
  const [locationsOpen, setLocationsOpen] = useState(false);

  const results = searchProfessionals(query, filters);
  const defaults = clearSearchFilters();
  const chips = [
    { key: 'specialty', label: filters.specialty },
    { key: 'minPrice', label: filters.minPrice && `A partir de R$ ${filters.minPrice.trim()}` },
    { key: 'maxPrice', label: filters.maxPrice && `Até R$ ${filters.maxPrice.trim()}` },
    { key: 'order', label: filters.order === defaults.order ? null : filters.order },
  ] as const;
  const activeChips = chips.filter((chip) => chip.label);

  function changeDraft(nextDraft: SearchFilters) {
    setDraft(nextDraft);
    setPriceError(null);
  }

  function applyFilters() {
    const error = validateSearchFilters(draft);
    setPriceError(error);
    if (!error) {
      setFilters(draft);
      setFiltersOpen(false);
    }
  }

  function clearSearch() {
    setQuery('');
    setFilters(clearSearchFilters());
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={results}
        keyExtractor={(professional) => professional.id}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[styles.list, compact && styles.compactList]}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppHeader patientName={patientName} compact={compact} onAccessibilityPress={() => navigation.navigate('Profile', { showAccessibility: true })} />
            <View style={styles.group}>
              <Text accessibilityRole="header" style={styles.title}>Encontre seu atendimento</Text>
              <Text style={styles.description}>Busque por especialidade ou profissional.</Text>
            </View>

            <View style={styles.group}>
              <SearchField compact={compact} value={query} onChangeText={setQuery} />
              <Text style={styles.label}>Localização</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Localização, ${location}`}
                accessibilityState={{ expanded: locationsOpen }}
                style={[styles.control, compact && styles.stackedControl]}
                onPress={() => setLocationsOpen(!locationsOpen)}
              >
                <Text style={[styles.label, styles.controlText]}>{location}</Text>
                <Text style={[styles.description, styles.controlText]}>{locationsOpen ? 'Fechar opções' : 'Alterar'}</Text>
              </Pressable>
              {locationsOpen && (
                <View accessibilityRole="radiogroup" style={styles.group}>
                  {locationReferences.map((reference) => (
                    <Pressable key={reference} accessibilityRole="radio"
                      accessibilityLabel={reference}
                      accessibilityState={{ checked: reference === location }}
                      style={styles.control}
                      onPress={() => {
                        setLocation(reference);
                        setLocationsOpen(false);
                      }}>
                      <Text style={styles.label}>{reference === location ? '✓ ' : ''}{reference}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
              <PrimaryButton label="Filtros" variant="outline" onPress={() => {
                changeDraft(filters);
                setFiltersOpen(true);
              }} />
            </View>

            {activeChips.length > 0 && (
              <View style={styles.chips}>
                {activeChips.map(({ key, label }) => (
                  <Pressable key={key} accessibilityRole="button" accessibilityLabel={`Remover filtro ${label}`}
                    style={[styles.control, styles.chip]}
                    onPress={() => setFilters((current) => ({ ...current, [key]: defaults[key] }))}>
                    <Text style={[styles.label, styles.controlText]}>{label} ×</Text>
                  </Pressable>
                ))}
                <Pressable accessibilityRole="button" accessibilityLabel="Limpar tudo"
                  style={styles.clear} onPress={clearSearch}>
                  <Text style={styles.label}>Limpar tudo</Text>
                </Pressable>
              </View>
            )}

            <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.results}>
              {results.length} {results.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProfessionalCard
            compact={compact}
            professional={item}
            onViewTimes={() => navigation.navigate('BookingSlots', { professionalId: item.id })}
          />
        )}
        ItemSeparatorComponent={ResultSeparator}
        ListEmptyComponent={<EmptySearchState onClear={clearSearch} />}
      />

      <SearchFiltersModal
        compact={compact}
        visible={filtersOpen}
        filters={draft}
        error={priceError}
        onChange={changeDraft}
        onClose={() => setFiltersOpen(false)}
        onClear={() => changeDraft(clearSearchFilters())}
        onApply={applyFilters}
      />
    </SafeAreaView>
  );
}

function ResultSeparator() {
  const styles = useThemedStyles(createStyles);
  return <View style={styles.separator} />;
}

const createStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  list: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  compactList: { paddingBottom: spacing.xxl },
  header: { gap: spacing.lg, paddingBottom: spacing.md },
  group: { gap: spacing.sm },
  title: { color: colors.textPrimary, fontSize: typography.greeting, fontWeight: '700' },
  description: { color: colors.textSecondary, fontSize: typography.body },
  label: { color: colors.primary, fontSize: typography.professionalName, fontWeight: '600' },
  control: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    minHeight: spacing.touchTarget,
    maxWidth: '100%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 11,
    backgroundColor: colors.surface,
  },
  stackedControl: { flexDirection: 'column', alignItems: 'stretch', flexWrap: 'nowrap' },
  controlText: { flexShrink: 1, minWidth: 0 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { backgroundColor: colors.secondary, borderRadius: spacing.xl },
  clear: {
    minHeight: spacing.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  results: { color: colors.textPrimary, fontSize: typography.sectionTitle, fontWeight: '700' },
  separator: { height: spacing.md },
});
