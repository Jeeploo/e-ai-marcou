import { useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../../theme/spacing';

type BookingDetailsLayoutProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export function BookingDetailsLayout({ title, subtitle, children }: BookingDetailsLayoutProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {children}
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
  heading: { gap: spacing.sm },
  title: { color: colors.textPrimary, fontSize: typography.greeting, fontWeight: '700' },
  subtitle: { color: colors.textSecondary, fontSize: typography.body },
});
