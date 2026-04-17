import { Page } from '@playwright/test';
import { json } from '@tests/utils';

import { MOCK_REMOTE_CONFIG } from './constants';
import {
  mockMainnetAlexAssetsRequest,
  mockMainnetAlexTokenPricesRequest,
} from './mock-alex-assets';
import { mockBitcoinFeeRequests } from './mock-bitcoin-fees';
import { mockBitflowRequests } from './mock-bitflow';
import { mockMainnetTestAccountInscriptionsRequests } from './mock-inscriptions-bis';
import { mockLaunchDarkly } from './mock-launchdarkly';
import { mockLeatherApiRequests } from './mock-leather-api';
import { mockMarketDataRequests } from './mock-market-data';
import { mockMainnetTestAccountSbtcDepositRequests } from './mock-sbtc';
import { mockMainnetTestAccountStacksBalancesRequest } from './mock-stacks-balances';
import { mockMainnetTestAccountStacksBalancesV2Request } from './mock-stacks-balances-v2';
import {
  mockBnsV2NamesRequestEmpty,
  mockMainnetTestAccountStacksBnsNameRequest,
} from './mock-stacks-bns';
import { mockStacksFeeRequests } from './mock-stacks-fees';
import { mockMainnetTestAccountStacksFTsRequest } from './mock-stacks-fts';
import { mockMainnetTestAccountStacksNFTsRequest } from './mock-stacks-nfts';
import {
  mockMainnetTestAccountStacksTxsRequests,
  mockWildcardStacksTxsRequests,
} from './mock-stacks-txs';
import {
  mockMainnetTestAccountBitcoinRequests,
  mockWildcardBitcoinTxsRequests,
} from './mock-utxos';

export async function setupMockApis(page: Page) {
  await Promise.all([
    page.route(/chrome-extension/, route => route.continue()),
    page.route(/github/, route => route.fulfill(json(MOCK_REMOTE_CONFIG))),
    page.route('https://api.hiro.so/', route => route.fulfill()),
    page.route('https://api.testnet.hiro.so/', route => route.fulfill()),
    mockWildcardBitcoinTxsRequests(page),
    mockWildcardStacksTxsRequests(page),
    mockMainnetTestAccountBitcoinRequests(page),
    mockBitcoinFeeRequests(page),
    mockStacksFeeRequests(page),
    mockMainnetTestAccountStacksBnsNameRequest(page),
    mockMainnetTestAccountStacksTxsRequests(page),
    mockMainnetTestAccountStacksNFTsRequest(page),
    mockMainnetTestAccountStacksFTsRequest(page),
    mockMainnetTestAccountStacksBalancesRequest(page),
    mockMainnetTestAccountStacksBalancesV2Request(page),
    mockMainnetAlexAssetsRequest(page),
    mockMainnetAlexTokenPricesRequest(page),
    mockLeatherApiRequests(page),
    mockMarketDataRequests(page),
    mockMainnetTestAccountSbtcDepositRequests(page),
    mockMainnetTestAccountInscriptionsRequests(page),
    mockLaunchDarkly(page),
    mockBnsV2NamesRequestEmpty(page),
    mockBitflowRequests(page),
  ]);
}
