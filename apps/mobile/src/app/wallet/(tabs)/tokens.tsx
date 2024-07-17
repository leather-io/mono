import { StyleSheet, Text, View } from 'react-native';

export default function TokenScreen() {
  return (
    <View style={styles.container}>
      <Text>Tokens 🪙</Text>
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
