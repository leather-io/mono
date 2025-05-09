import { BitcoinChainConfig } from '@leather.io/models';

interface MakeBitcoinTxExplorerLinkArgs {
  txid: string;
  bitcoin: BitcoinChainConfig;
}
export function makeBitcoinTxExplorerLink({
  txid,
  bitcoin: { bitcoinUrl, bitcoinNetwork },
}: MakeBitcoinTxExplorerLinkArgs) {
  const mempoolBaseUrl = 'https://mempool.space';

  switch (bitcoinNetwork) {
    case 'mainnet':
      return `${mempoolBaseUrl}/tx/${txid}`;
    case 'testnet3':
      return `${mempoolBaseUrl}/testnet/tx/${txid}`;
    case 'testnet4':
      return `${mempoolBaseUrl}/testnet4/tx/${txid}`;
    case 'signet':
      return `${mempoolBaseUrl}/signet/tx/${txid}`;
    // LEA-2582 PETE - custom networks / regtest
    // not yet available on mobile so simplify this to remove
    // thats the only think using the ID regtest
    case 'regtest':
      return `${bitcoinUrl}/tx/${txid}`;
  }
}
