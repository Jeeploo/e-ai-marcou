import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { searchOrders, specialties, type SearchFilters } from '../../models/SearchModel';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { PrimaryButton } from './PrimaryButton';

type SearchFiltersModalProps = {
  compact: boolean;
  visible: boolean;
  filters: SearchFilters;
  error: string | null;
  onChange: (filters: SearchFilters) => void;
  onClose: () => void;
  onClear: () => void;
  onApply: () => void;
};

function FilterOption({ label, selected, onPress }: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.option, selected && styles.selectedOption]}
    >
      <Text style={styles.label}>{selected ? '✓ ' : ''}{label}</Text>
    </Pressable>
  );
}

export function SearchFiltersModal({
  compact, visible, filters, error, onChange, onClose, onClear, onApply,
}: SearchFiltersModalProps) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen} accessibilityViewIsModal>
        <KeyboardAvoidingView
          style={styles.screen}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            stickyHeaderIndices={compact ? [0] : undefined}
          >
            <View style={[styles.content, styles.heading]}>
              <Text accessibilityRole="header" style={styles.title}>Filtros</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar filtros"
                onPress={onClose} style={styles.option}>
                <Text style={styles.label}>Fechar</Text>
              </Pressable>
            </View>

            <View style={styles.content}>
              <View style={styles.section}>
                <Text accessibilityRole="header" style={styles.label}>Especialidade</Text>
                <View accessibilityRole="radiogroup" style={[styles.options, compact && styles.stackedOptions]}>
                  <FilterOption label="Todas" selected={filters.specialty === null}
                    onPress={() => onChange({ ...filters, specialty: null })} />
                  {specialties.map((specialty) => (
                    <FilterOption key={specialty} label={specialty}
                      selected={filters.specialty === specialty}
                      onPress={() => onChange({ ...filters, specialty })} />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text accessibilityRole="header" style={styles.label}>Preço</Text>
                <Text style={styles.label}>Preço mínimo</Text>
                <TextInput
                  accessibilityLabel="Preço mínimo em reais"
                  keyboardType="decimal-pad"
                  value={filters.minPrice}
                  onChangeText={(minPrice) => onChange({ ...filters, minPrice })}
                  style={styles.input}
                />
                <Text style={styles.label}>Preço máximo</Text>
                <TextInput
                  accessibilityLabel="Preço máximo em reais"
                  keyboardType="decimal-pad"
                  value={filters.maxPrice}
                  onChangeText={(maxPrice) => onChange({ ...filters, maxPrice })}
                  style={styles.input}
                />
                {error && (
                  <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>
                    {error}
                  </Text>
                )}
              </View>

              <View style={styles.section}>
                <Text accessibilityRole="header" style={styles.label}>Ordenação</Text>
                <View accessibilityRole="radiogroup" style={[styles.options, compact && styles.stackedOptions]}>
                  {searchOrders.map((order) => (
                    <FilterOption key={order} label={order} selected={filters.order === order}
                      onPress={() => onChange({ ...filters, order })} />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <PrimaryButton label="Limpar filtros" variant="outline" onPress={onClear} />
                <PrimaryButton label="Aplicar filtros" onPress={onApply} />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
  content: { width: '100%', maxWidth: 600, alignSelf: 'center', gap: spacing.lg },
  heading: {
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: { flexShrink: 1, minWidth: 0, color: colors.textPrimary, fontSize: typography.greeting, fontWeight: '700' },
  section: { gap: spacing.sm },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stackedOptions: { flexDirection: 'column', flexWrap: 'nowrap' },
  option: {
    minHeight: spacing.touchTarget,
    maxWidth: '100%',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: colors.surface,
  },
  selectedOption: { backgroundColor: colors.secondary, borderColor: colors.primary },
  label: { color: colors.primary, fontSize: typography.professionalName, fontWeight: '600' },
  input: {
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: colors.surface,
    color: colors.textPrimary,
    fontSize: typography.professionalName,
  },
  error: { color: colors.accent, fontSize: typography.body },
});
