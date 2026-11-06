import type { BrowserContext, Page } from '@playwright/test';
import {
  mockMainnetAlexAssetsRequest,
  mockMainnetAlexTokenPricesRequest,
} from '@tests/mocks/mock-alex-assets';
import { mockBitcoinFeeRequests } from '@tests/mocks/mock-bitcoin-fees';
import { mockTestAccountBtcBroadcastTransaction } from '@tests/mocks/mock-bitcoin-tx';
import { mockBitflowRequests } from '@tests/mocks/mock-bitflow';
import { mockBitcoinMainnetBroadcast } from '@tests/mocks/mock-btc-txs';
import { mockCmsRequests } from '@tests/mocks/mock-cms';
import {
  mockEmptyLeatherApiUtxosRequest,
  mockLeatherApiRequests,
} from '@tests/mocks/mock-leather-api';
import { mockMarketDataRequests } from '@tests/mocks/mock-market-data';
import {
  mockMixedUtxosForSend,
  mockNativeSegwitOnlyUtxosForSend,
} from '@tests/mocks/mock-mixed-utxos';
import { mockProposeMultisigTransaction } from '@tests/mocks/mock-multisig';
import { mockNetworkValidationRequests } from '@tests/mocks/mock-network-validation';
import { mockMainnetTestAccountSbtcDepositRequests } from '@tests/mocks/mock-sbtc';
import {
  mockEmptyStacksBalancesRequest,
  mockMainnetTestAccountStacksBalancesRequest,
} from '@tests/mocks/mock-stacks-balances';
import {
  mockEmptyStacksBalancesV2Request,
  mockMainnetTestAccountStacksBalancesV2Request,
} from '@tests/mocks/mock-stacks-balances-v2';
import { mockBnsV2NamesRequest, mockBnsV2NamesRequestEmpty } from '@tests/mocks/mock-stacks-bns';
import { mockStacksContractInterfaceRequests } from '@tests/mocks/mock-stacks-contract-interfaces';
import { mockStacksFeeRequests } from '@tests/mocks/mock-stacks-fees';
import { mockMainnetTestAccountStacksFTsRequest } from '@tests/mocks/mock-stacks-fts';
import { mockMainnetTestAccountStacksNFTsRequest } from '@tests/mocks/mock-stacks-nfts';
import { mockStacksStakingRequests } from '@tests/mocks/mock-stacks-staking';
import {
  mockMainnetTestAccountStacksTxsRequests,
  mockSip10LeatherTestTokenBalance,
  mockStacksBroadcastTransaction,
  mockStacksPendingTransaction,
  mockStacksRawTx,
  mockTestAccountStacksTxsRequestsWithPendingTx,
  mockWildcardStacksTxsRequests,
} from '@tests/mocks/mock-stacks-txs';
import {
  mockMainnetTestAccountBitcoinRequests,
  mockMainnetTestAccountEmptyUtxosRequests,
  mockTestnetTestAccountEmptyUtxosRequests,
  mockWildcardBitcoinTxsRequests,
} from '@tests/mocks/mock-utxos';

type ContextMock = (target: Page | BrowserContext) => Promise<unknown>;
type PageMock = (page: Page) => Promise<void>;

export const baseMockNames = ['setupMockApis', 'mockUnhandledRequests'] as const;

const contextMocks: Readonly<Record<string, ContextMock>> = {
  mockBitcoinFeeRequests,
  mockBitflowRequests,
  mockBnsV2NamesRequest,
  mockBnsV2NamesRequestEmpty,
  mockCmsRequests,
  mockEmptyLeatherApiUtxosRequest,
  mockEmptyStacksBalancesRequest,
  mockEmptyStacksBalancesV2Request,
  mockLeatherApiRequests,
  mockMainnetAlexAssetsRequest,
  mockMainnetAlexTokenPricesRequest,
  mockMainnetTestAccountBitcoinRequests,
  mockMainnetTestAccountEmptyUtxosRequests,
  mockMainnetTestAccountSbtcDepositRequests,
  mockMainnetTestAccountStacksBalancesRequest,
  mockMainnetTestAccountStacksBalancesV2Request,
  mockMainnetTestAccountStacksFTsRequest,
  mockMainnetTestAccountStacksNFTsRequest,
  mockMainnetTestAccountStacksTxsRequests,
  mockMarketDataRequests,
  mockMixedUtxosForSend,
  mockNativeSegwitOnlyUtxosForSend,
  mockNetworkValidationRequests,
  mockProposeMultisigTransaction,
  mockSip10LeatherTestTokenBalance,
  mockStacksBroadcastTransaction,
  mockStacksContractInterfaceRequests,
  mockStacksFeeRequests,
  mockStacksPendingTransaction,
  mockStacksRawTx,
  mockStacksStakingRequests,
  mockTestAccountStacksTxsRequestsWithPendingTx,
  mockTestnetTestAccountEmptyUtxosRequests,
  mockWildcardBitcoinTxsRequests,
  mockWildcardStacksTxsRequests,
};

const pageMocks: Readonly<Record<string, PageMock>> = {
  mockBitcoinMainnetBroadcast,
  mockTestAccountBtcBroadcastTransaction,
};

export interface AppliedMocks {
  readonly applied: string[];
  readonly skipped: string[];
}

export async function applyMocks(
  names: readonly string[],
  context: BrowserContext,
  page: Page
): Promise<AppliedMocks> {
  const applied: string[] = [];
  const skipped: string[] = [];
  for (const name of names) {
    if (baseMockNames.some(base => base === name)) continue;
    const contextMock = contextMocks[name];
    const pageMock = pageMocks[name];
    if (contextMock) {
      await contextMock(context);
      applied.push(name);
      continue;
    }
    if (pageMock) {
      await pageMock(page);
      applied.push(name);
      continue;
    }
    skipped.push(name);
  }
  return { applied, skipped };
}
