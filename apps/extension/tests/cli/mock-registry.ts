import type { BrowserContext, Page } from '@playwright/test';
import {
  mockMainnetAlexAssetsRequest,
  mockMainnetAlexTokenPricesRequest,
} from '@tests/mocks/mock-alex-assets';
import { setupMockApis } from '@tests/mocks/mock-apis';
import { mockBitcoinFeeRequests } from '@tests/mocks/mock-bitcoin-fees';
import { mockBitflowRequests } from '@tests/mocks/mock-bitflow';
import { mockCmsRequests } from '@tests/mocks/mock-cms';
import { mockLaunchDarkly } from '@tests/mocks/mock-launchdarkly';
import {
  mockEmptyLeatherApiUtxosRequest,
  mockLeatherApiRequests,
} from '@tests/mocks/mock-leather-api';
import { mockMarketDataRequests } from '@tests/mocks/mock-market-data';
import {
  mockMixedUtxosForSend,
  mockNativeSegwitOnlyUtxosForSend,
} from '@tests/mocks/mock-mixed-utxos';
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
  mockMainnetTestAccountStacksConfirmedTxsRequests,
  mockMainnetTestAccountStacksTxsRequests,
  mockSip10LeatherTestTokenBalance,
  mockStacksPendingTransaction,
  mockStacksRawTx,
  mockTestAccountStacksTxsRequestsWithPendingTx,
  mockWildcardStacksTxsRequests,
} from '@tests/mocks/mock-stacks-txs';
import { mockUnhandledRequests } from '@tests/mocks/mock-unhandled-requests';
import {
  mockMainnetTestAccountBitcoinRequests,
  mockMainnetTestAccountEmptyUtxosRequests,
  mockTestnetTestAccountEmptyUtxosRequests,
  mockWildcardBitcoinTxsRequests,
} from '@tests/mocks/mock-utxos';
import { keys } from 'remeda';
import { z } from 'zod';

import { VerifyUsageError } from './verify-errors';

export interface MockInstaller {
  (target: Page | BrowserContext): Promise<void>;
}

export const mockRegistry = {
  mockBitcoinFeeRequests,
  mockBitflowRequests,
  mockBnsV2NamesRequest,
  mockBnsV2NamesRequestEmpty,
  mockCmsRequests,
  mockEmptyLeatherApiUtxosRequest,
  mockEmptyStacksBalancesRequest,
  mockEmptyStacksBalancesV2Request,
  mockLaunchDarkly,
  mockLeatherApiRequests,
  mockMainnetAlexAssetsRequest,
  mockMainnetAlexTokenPricesRequest,
  mockMainnetTestAccountBitcoinRequests,
  mockMainnetTestAccountEmptyUtxosRequests,
  mockMainnetTestAccountSbtcDepositRequests,
  mockMainnetTestAccountStacksBalancesRequest,
  mockMainnetTestAccountStacksBalancesV2Request,
  mockMainnetTestAccountStacksConfirmedTxsRequests,
  mockMainnetTestAccountStacksFTsRequest,
  mockMainnetTestAccountStacksNFTsRequest,
  mockMainnetTestAccountStacksTxsRequests,
  mockMarketDataRequests,
  mockMixedUtxosForSend,
  mockNativeSegwitOnlyUtxosForSend,
  mockNetworkValidationRequests,
  mockSip10LeatherTestTokenBalance,
  mockStacksContractInterfaceRequests,
  mockStacksFeeRequests,
  mockStacksPendingTransaction,
  mockStacksRawTx,
  mockStacksStakingRequests,
  mockTestAccountStacksTxsRequestsWithPendingTx,
  mockTestnetTestAccountEmptyUtxosRequests,
  mockUnhandledRequests,
  mockWildcardBitcoinTxsRequests,
  mockWildcardStacksTxsRequests,
  setupMockApis,
} satisfies Record<string, MockInstaller>;

export type MockName = keyof typeof mockRegistry;

export const mockModes = ['default', 'none'] as const;
export type MockMode = (typeof mockModes)[number];

export interface MocksPlan {
  mode: MockMode;
  extras: MockName[];
}

export const mockNames = keys(mockRegistry);

const extraMockPrefix = '+';
const mockSpecSeparator = ',';
const mockNameSchema = z.enum(mockNames);
const mockModeSchema = z.enum(mockModes);

export function parseMocksSpec(spec: string): MocksPlan {
  const [modeToken, ...extraTokens] = spec.split(mockSpecSeparator).map(token => token.trim());
  const mode = mockModeSchema.safeParse(modeToken);
  if (!mode.success) {
    throw new VerifyUsageError(
      `--mocks expects ${mockModes.join(' | ')} optionally followed by ${extraMockPrefix}name entries, got "${spec}"`
    );
  }
  if (mode.data === 'none' && extraTokens.length > 0) {
    throw new VerifyUsageError('--mocks none installs no routes, so it cannot take extra mocks');
  }
  const extras = extraTokens.map(token => {
    if (!token.startsWith(extraMockPrefix)) {
      throw new VerifyUsageError(`Extra mocks must start with ${extraMockPrefix}, got "${token}"`);
    }
    const name = mockNameSchema.safeParse(token.slice(extraMockPrefix.length));
    if (!name.success) {
      throw new VerifyUsageError(
        `Unknown mock "${token.slice(extraMockPrefix.length)}". Known mocks: ${mockNames.join(', ')}`
      );
    }
    return name.data;
  });
  return { mode: mode.data, extras };
}
