import { useAppTheme, useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { spacing } from '../../theme/spacing';

type SearchFieldProps = {
  value: string;
  compact: boolean;
  onChangeText: (value: string) => void;
};

export function SearchField({ value, compact, onChangeText }: SearchFieldProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useAppTheme();
  return (
    <View style={[styles.field, compact && styles.stackedField]}>
      <TextInput
        accessibilityLabel="Especialidade ou profissional"
        placeholder="Especialidade ou profissional"
        placeholderTextColor={colors.textSecondary}
        returnKeyType="search"
        multiline={compact}
        submitBehavior="blurAndSubmit"
        autoCorrect={false}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, compact && styles.stackedInput]}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Limpar busca"
          onPress={() => onChangeText('')}
          style={[styles.clear, compact && styles.stackedClear]}
        >
          <Text style={styles.clearLabel}>Limpar</Text>
        </Pressable>
      )}
    </View>
  );
}

const createStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
  field: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 11,
    backgroundColor: colors.surface,
  },
  stackedField: { flexDirection: 'column', flexWrap: 'nowrap', alignItems: 'stretch' },
  input: {
    minWidth: 0,
    flexGrow: 1,
    flexBasis: '65%',
    minHeight: spacing.touchTarget,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.professionalName,
  },
  stackedInput: { flexGrow: 0, flexBasis: 'auto' },
  stackedClear: { alignSelf: 'flex-end', maxWidth: '100%' },
  clear: {
    minHeight: spacing.touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  clearLabel: { color: colors.primary, fontSize: typography.button, fontWeight: '600' },
});
