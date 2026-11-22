import { useEffect } from 'react';
import { AccessibilityInfo, ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import { spacing } from '../../theme/spacing';

export function AppointmentStatusMessage({ message, loading = false }: { message: string; loading?: boolean }) {
  const styles = useThemedStyles(createStyles);
  useEffect(() => {
    if (Platform.OS === 'ios') AccessibilityInfo.announceForAccessibility(message);
  }, [message]);

  return (
    <View style={styles.row}>
      {loading && <ActivityIndicator accessible={false} style={styles.indicator} color={styles.text.color} />}
      <Text accessibilityLiveRegion="polite" style={styles.text}>{message}</Text>
    </View>
  );
}

const createStyles = ({ colors, typography }: AppTheme) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  text: { flex: 1, fontSize: typography.body, color: colors.textPrimary },
  indicator: { flexShrink: 0 },
});
