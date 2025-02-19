export interface NetworkConfiguration {
  name: string;
  id: string;
  chain: {
    bitcoin: {
      blockchain: 'bitcoin';
      bitcoinUrl: string;
      bitcoinNetwork: 'mainnet' | 'regtest' | 'signet' | 'testnet3' | 'testnet4';
      mode: 'mainnet' | 'regtest' | 'signet' | 'testnet';
    };
    stacks: {
      blockchain: string;
      url: string;
      chainId: number;
    };
  };
}
