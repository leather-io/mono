import { StyleSheet, View } from 'react-native';

import { TransText } from '@/components/trans-text';
import { APP_ROUTES } from '@/constants';
import { useRouter } from 'expo-router';

import { TouchableOpacity } from '@leather.io/ui/native';

export default function SwapScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <TransText>Collectibles 🖼️</TransText>
      <TouchableOpacity
        onPress={() => router.navigate(APP_ROUTES.WalletBrowser)}
        p="4"
        bg="base.ink.background-primary"
        borderRadius="sm"
      >
        <TransText>navigate to browser</TransText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
