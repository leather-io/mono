import { StyleSheet, Text, View } from 'react-native';

export default function ReceiveScreen() {
  return (
    <View style={styles.container}>
      <Text>Receive 💰</Text>
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
