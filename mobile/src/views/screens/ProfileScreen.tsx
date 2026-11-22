import appConfig from '../../../app.json';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { AccessibilityInfo, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { demoPatient } from '../../config/api';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useThemedStyles, type AppTheme } from '../../hooks/useAppTheme';
import type { MainTabParamList } from '../../navigation/types';
import { spacing } from '../../theme/spacing';

type ProfileScreenProps = BottomTabScreenProps<MainTabParamList, 'Profile'>;

export function ProfileScreen({ navigation, route }: ProfileScreenProps) {
  const styles = useThemedStyles(createStyles);
  const { largeTextEnabled, highContrastEnabled, setLargeTextEnabled, setHighContrastEnabled } = useAccessibility();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const accessibilityHeading = useRef<ComponentRef<typeof Text>>(null);
  const [sectionY, setSectionY] = useState<number>();
  const isFocused = useIsFocused();
  const showAccessibility = route.params?.showAccessibility;
  const preferences = [
    { label: 'Texto maior', enabled: largeTextEnabled, setEnabled: setLargeTextEnabled },
    { label: 'Alto contraste', enabled: highContrastEnabled, setEnabled: setHighContrastEnabled },
  ];

  useEffect(() => {
    if (!isFocused || !showAccessibility || sectionY === undefined) return;
    scroll.current?.scrollTo({ y: sectionY, animated: false });
    const frame = requestAnimationFrame(() => {
      if (accessibilityHeading.current) AccessibilityInfo.sendAccessibilityEvent(accessibilityHeading.current, 'focus');
      navigation.setParams({ showAccessibility: undefined });
    });
    return () => cancelAnimationFrame(frame);
  }, [isFocused, navigation, sectionY, showAccessibility]);

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.screen}>
      <ScrollView ref={scroll} contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <Text accessibilityRole="header" style={styles.title}>Meu perfil</Text>
          <Text style={styles.sectionTitle}>{demoPatient.name}</Text>
        </View>
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Preferências</Text>
          <Text style={styles.body}>Local principal: {demoPatient.savedLocations[0]}</Text>
        </View>
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Locais salvos</Text>
          {demoPatient.savedLocations.map((location) => <Text key={location} style={styles.body}>{location}</Text>)}
        </View>
        <View style={styles.card} onLayout={({ nativeEvent }) => setSectionY(nativeEvent.layout.y)}>
          <Text ref={accessibilityHeading} accessible accessibilityRole="header" style={styles.sectionTitle}>
            Acessibilidade
          </Text>
          {preferences.map(({ label, enabled, setEnabled }) => (
            <View key={label} style={styles.preference}>
              <Text accessible={false} importantForAccessibility="no" style={styles.preferenceLabel}>{label}</Text>
              <Switch
                accessibilityLabel={label}
                accessibilityRole="switch"
                accessibilityState={{ checked: enabled }}
                value={enabled}
                onValueChange={setEnabled}
                trackColor={styles.switchTrack}
                style={styles.switch}
              />
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Sobre</Text>
          <Text style={styles.body}>e aí, marcou?</Text>
          <Text style={styles.body}>Versão {appConfig.expo.version} · Demonstração acadêmica</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = ({ colors, typography }: AppTheme) => ({
  ...StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    content: {
      width: '100%', maxWidth: 600, alignSelf: 'center', padding: spacing.lg,
      paddingBottom: spacing.xxl, gap: spacing.lg,
    },
    heading: { gap: spacing.xs },
    title: { color: colors.textPrimary, fontSize: typography.greeting, fontWeight: '700' },
    sectionTitle: { color: colors.textPrimary, fontSize: typography.sectionTitle, fontWeight: '700' },
    body: { color: colors.textSecondary, fontSize: typography.body },
    card: {
      gap: spacing.sm, padding: spacing.lg, borderRadius: 14, borderWidth: 1,
      borderColor: colors.border, backgroundColor: colors.surface,
    },
    preference: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: spacing.touchTarget },
    preferenceLabel: { flex: 1, color: colors.textPrimary, fontSize: typography.body },
    switch: { minWidth: spacing.touchTarget, minHeight: spacing.touchTarget },
  }),
  switchTrack: { false: colors.border, true: colors.primary },
});
