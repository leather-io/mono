import { TokensApi } from '@hirosystems/token-metadata-api-client';
import { STX20_API_BASE_URL_MAINNET } from '@leather-wallet/models';
import {
  AccountsApi,
  BlocksApi,
  Configuration,
  type ConfigurationParameters,
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
import axios from 'axios';

import { useLeatherNetwork } from '../leather-query-provider';
import { wrappedFetch as fetchApi } from './fetch-wrapper';

export interface Stx20Balance {
  ticker: string;
  balance: string;
  updateDate: string;
}

interface Stx20BalanceResponse {
  address: string;
  balances: Stx20Balance[];
}

function Stx20Api() {
  const url = STX20_API_BASE_URL_MAINNET;

  return {
    async getStx20Balances(address: string) {
      const resp = await axios.get<Stx20BalanceResponse>(`${url}/balance/${address}`);
      return resp.data.balances;
    },
  };
}

export interface StacksClient {
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
  tokensApi: TokensApi;
  stx20Api: ReturnType<typeof Stx20Api>;
}

export function stacksClient(configParams: ConfigurationParameters): StacksClient {
  const config = new Configuration(configParams);

  return {
    smartContractsApi: new SmartContractsApi(config),
    accountsApi: new AccountsApi(config),
    infoApi: new InfoApi(config),
    transactionsApi: new TransactionsApi(config),
    blocksApi: new BlocksApi(config),
    faucetsApi: new FaucetsApi(config),
    namesApi: new NamesApi(config),
    feesApi: new FeesApi(config),
    searchApi: new SearchApi(config),
    rosettaApi: new RosettaApi(config),
    fungibleTokensApi: new FungibleTokensApi(config),
    nonFungibleTokensApi: new NonFungibleTokensApi(config),
    tokensApi: new TokensApi({ basePath: config.basePath }),
    stx20Api: Stx20Api(),
  };
}

export function useStacksClient() {
  const network = useLeatherNetwork();

  return stacksClient({
    basePath: network.chain.stacks.url,
    fetchApi,
  });
}
