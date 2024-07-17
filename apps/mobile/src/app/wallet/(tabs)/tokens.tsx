import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

import { Spinner } from '@/components/spinner';
import { TextInput } from '@/components/text-input';
import { usePersistedStore, useProtectedStore } from '@/state';
import { useKeyStore } from '@/state/bitcoin-accounts/bitcoin-state';
import { clearAllPersistedStorage } from '@/state/utils';

export default function TokensScreen() {
  const protectedStore = useProtectedStore();

  const keyStore = useKeyStore();

  const persisted = usePersistedStore();
  const [text, onChangeText] = useState('7d84296b');
  const [isGeneratingMnemonic, setIsGeneratingMnemonic] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Text>Mnemonic store</Text>
      <Button
        // Doesn't work
        title={isGeneratingMnemonic ? 'Generating…' : 'Generate mnemonic'}
        onPress={async () => {
          setIsGeneratingMnemonic(true);
          await keyStore.generateNewMnemonicPhrase();
          setIsGeneratingMnemonic(false);
        }}
      />
      <Spinner />
      {Object.keys(protectedStore.mnemonic.entities).length > 0 && (
        <>
          <Text>Accounts store</Text>
          <TextInput
            autoCapitalize="none"
            inputState="default"
            onChangeText={onChangeText}
            value={text}
          />
          <Button
            title="Generate account from fingerprint"
            onPress={async () => keyStore.createNewSoftwareAccountForKeychain(text)}
          />
        </>
      )}
      <Button title="Clear protected store" onPress={() => clearAllPersistedStorage()} />
      <Text>{JSON.stringify(protectedStore, null, 2)}</Text>
      <Text>{JSON.stringify(persisted, null, 2)}</Text>
      <View style={{ paddingBottom: 1000, height: 100 }} />
      <View style={{ paddingBottom: 1000, height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    fontSize: 9,
    marginTop: 180,
  },
});
