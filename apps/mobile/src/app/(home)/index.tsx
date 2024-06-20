import { SafeAreaView } from 'react-native';

import { router } from 'expo-router';

import { Button } from '@leather-wallet/ui/native';

export default function Home() {
  return (
    <SafeAreaView>
      <Button
        variant="solid"
        label="Make new wallet"
        onPress={() => {
          // eslint-disable-next-line no-console
          console.log('Make new wallet');
        }}
      />
      <Button
        variant="solid"
        label="Go to start page"
        onPress={() => {
          router.replace('/waiting-list');
        }}
      />
    </SafeAreaView>
  );
}
