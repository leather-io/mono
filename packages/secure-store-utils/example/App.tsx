import { StyleSheet, Text, View } from 'react-native';

import * as SecureStoreUtils from 'secure-store-utils';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>{SecureStoreUtils.hello()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
