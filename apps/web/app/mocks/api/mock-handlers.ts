import { HttpResponse, http } from 'msw';

import { delay } from '@leather.io/utils';

import { accountsHandler } from './hiro.so/accounts-address';
import { accountsBalanceHandler } from './hiro.so/accounts-address-balance';
import { accountsBalanceStxHandler } from './hiro.so/accounts-address-balance-stx';
import { transactionWithTransfersHandler } from './hiro.so/address-address-transactions-with-transfers';
import { blockTimesHandler } from './hiro.so/block-times';
import { getAllowanceContractCallersHandlers } from './hiro.so/get-allowance-contract-callers';
import { hiroInfoHandler } from './hiro.so/info';
import { mempoolHandler } from './hiro.so/mempool';
import { poxMainnetHandler } from './hiro.so/pox';
import { pox4GetDelegationInfo } from './hiro.so/pox4-get-delegation-info';
import { poxGetStackerInfoHandler } from './hiro.so/pox4-get-stacker-info';
import {
  pox5CustomContractInterfaceHandler,
  pox5CustomFeesBipsHandler,
  pox5CustomGetEarnedStakerRewardsHandler,
  pox5CustomGetPoxAddrHandler,
  pox5GetSignerInfoHandler,
} from './hiro.so/pox5-custom-signer-manager';
import { pox5GetStakerInfoNoneHandler } from './hiro.so/pox5-get-staker-info';
import { pox5MockOverrideHandlers } from './hiro.so/pox5-mock-overrides';
import { pox5PinnedNetworkHandlers } from './hiro.so/pox5-pinned-network';
import {
  pox5FeesBipsHandler,
  pox5GetEarnedStakerRewardsHandler,
  pox5GetPoxAddrHandler,
} from './hiro.so/pox5-signer-manager';
import { stackingDaoContractCallHandler } from './hiro.so/stacking-dao-core-v4';
import { ststxTokenBalanceContractCallHandler } from './hiro.so/ststx-token-get-balance';
import { nftHoldingsHandler } from './hiro.so/tokens-nft-holdings';
import { leatherMarketPricesHandler } from './leather.io/market-prices';
import { multisigHandlers } from './leather.io/multisig';
import { leatherPingHandler } from './leather.io/ping';
import { leatherZealyQuestConnectEarnHandler } from './leather.io/quests-connect-earn';
import { poolsHandler } from './stacking-tracker.com/pools';
import { tokenHandler } from './stacking-tracker.com/tokens';

async function delayedJsonResponse(resp: Record<string, unknown>) {
  await delay(400);
  return HttpResponse.json(resp);
}

const endpoints = [
  leatherMarketPricesHandler,
  leatherPingHandler,
  leatherZealyQuestConnectEarnHandler,
  poxGetStackerInfoHandler,
  poxMainnetHandler,
  accountsHandler,
  accountsBalanceHandler,
  hiroInfoHandler,
  nftHoldingsHandler,
  transactionWithTransfersHandler,
  mempoolHandler,
  ststxTokenBalanceContractCallHandler,
  stackingDaoContractCallHandler,
  pox4GetDelegationInfo,
  pox5GetStakerInfoNoneHandler,
  pox5GetEarnedStakerRewardsHandler,
  pox5GetPoxAddrHandler,
  pox5FeesBipsHandler,
  pox5CustomContractInterfaceHandler,
  pox5GetSignerInfoHandler,
  pox5CustomGetEarnedStakerRewardsHandler,
  pox5CustomGetPoxAddrHandler,
  pox5CustomFeesBipsHandler,
  blockTimesHandler,
  getAllowanceContractCallersHandlers,
  accountsBalanceStxHandler,
  poolsHandler,
  tokenHandler,
];

// When the pox-5 chain shares a host with the app-network mocks (mainnet),
// rewriting to the pinned host reproduces endpoints already registered above.
const pinnedNetworkEndpoints = pox5PinnedNetworkHandlers.filter(
  pinned => !endpoints.some(({ method, path }) => method === pinned.method && path === pinned.path)
);

export const successHandlers = [
  ...pox5MockOverrideHandlers,
  ...[...endpoints, ...pinnedNetworkEndpoints].map(endpoint =>
    http[endpoint.method](endpoint.path, async () => delayedJsonResponse(endpoint.resp))
  ),
  ...multisigHandlers,
];
