import { StyleSheet, Text, View } from 'react-native';

import { APP_ROUTES } from '@/constants';
import { useRouter } from 'expo-router';

import { TouchableOpacity } from '@leather.io/ui/native';

export default function SwapScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text>Collectibles 🖼️</Text>
      <TouchableOpacity
        onPress={() => router.navigate(APP_ROUTES.WalletBrowser)}
        p="4"
        bg="base.ink.background-primary"
        borderRadius="sm"
      >
        <Text>navigate to browser</Text>
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
