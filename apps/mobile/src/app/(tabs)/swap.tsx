import { StyleSheet, Text, View } from 'react-native';

export default function SwapScreen() {
  return (
    <View style={styles.container}>
      <Text>Swap 🔄</Text>
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
