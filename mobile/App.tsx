import { AccessibilityProvider } from './src/contexts/AccessibilityContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AccessibilityProvider>
        <RootNavigator />
      </AccessibilityProvider>
    </SafeAreaProvider>
  );
}
