import { StyleSheet, View } from 'react-native';

import { TransText } from '@/components/trans-text';

export default function TokenScreen() {
  return (
    <View style={styles.container}>
      <TransText>Tokens 🪙</TransText>
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
