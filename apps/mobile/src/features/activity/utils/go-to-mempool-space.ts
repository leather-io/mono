import { Linking } from 'react-native';

export async function goToMempoolSpace(txid: string) {
  const url = `https://mempool.space/tx/${txid}`;
  await Linking.openURL(url);
}
