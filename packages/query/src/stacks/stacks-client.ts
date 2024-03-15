import { useMemo } from 'react';

import { HIRO_API_BASE_URL_MAINNET, HIRO_API_BASE_URL_TESTNET } from '@leather-wallet/constants';
import { whenStacksChainId } from '@leather-wallet/stacks';
import {
  AccountsApi,
  BlocksApi,
  Configuration,
  ConfigurationParameters,
  FaucetsApi,
  FeesApi,
  FungibleTokensApi,
  InfoApi,
  NamesApi,
  NonFungibleTokensApi,
  RosettaApi,
  SearchApi,
  SmartContractsApi,
  TransactionsApi,
} from '@stacks/blockchain-api-client';
import { ChainID } from '@stacks/transactions';

import { useCurrentNetworkState } from '../leather-query-provider';
import { TokenMetadataClient } from './token-metadata-client';
import { createStacksClientConfig, createTokenMetadataConfig } from './utils';

export class StacksClient {
  configuration: Configuration;
  smartContractsApi: SmartContractsApi;
  accountsApi: AccountsApi;
  infoApi: InfoApi;
  transactionsApi: TransactionsApi;
  blocksApi: BlocksApi;
  faucetsApi: FaucetsApi;
  namesApi: NamesApi;
  feesApi: FeesApi;
  searchApi: SearchApi;
  rosettaApi: RosettaApi;
  fungibleTokensApi: FungibleTokensApi;
  nonFungibleTokensApi: NonFungibleTokensApi;

  constructor(config: ConfigurationParameters) {
    this.configuration = new Configuration(config);
    this.smartContractsApi = new SmartContractsApi(this.configuration);
    this.accountsApi = new AccountsApi(this.configuration);
    this.infoApi = new InfoApi(this.configuration);
    this.transactionsApi = new TransactionsApi(this.configuration);
    this.blocksApi = new BlocksApi(this.configuration);
    this.faucetsApi = new FaucetsApi(this.configuration);
    this.namesApi = new NamesApi(this.configuration);
    this.feesApi = new FeesApi(this.configuration);
    this.searchApi = new SearchApi(this.configuration);
    this.rosettaApi = new RosettaApi(this.configuration);
    this.fungibleTokensApi = new FungibleTokensApi(this.configuration);
    this.nonFungibleTokensApi = new NonFungibleTokensApi(this.configuration);
  }
}

export function useStacksClient() {
  const network = useCurrentNetworkState();

  return useMemo(() => {
    const config = createStacksClientConfig(network.chain.stacks.url);
    return new StacksClient(config);
  }, [network.chain.stacks.url]);
}

export function useTokenMetadataClient() {
  const currentNetwork = useCurrentNetworkState();

  const basePath = whenStacksChainId(currentNetwork.chain.stacks.chainId)({
    [ChainID.Mainnet]: HIRO_API_BASE_URL_MAINNET,
    [ChainID.Testnet]: HIRO_API_BASE_URL_TESTNET,
  });

  const config = createTokenMetadataConfig(basePath);

  return new TokenMetadataClient(config);
}
