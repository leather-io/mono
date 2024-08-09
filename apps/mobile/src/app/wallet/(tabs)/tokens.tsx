import { StyleSheet, View } from 'react-native';

import { t } from '@lingui/macro';

import { Text } from '@leather.io/ui/native';

export default function TokenScreen() {
  return (
    <View style={styles.container}>
      <Text>{t`Tokens 🪙`}</Text>
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
