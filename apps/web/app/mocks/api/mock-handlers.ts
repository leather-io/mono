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
import { pox5GetStakerInfoNoneHandler } from './hiro.so/pox5-get-staker-info';
import { pox5MockOverrideHandlers } from './hiro.so/pox5-mock-overrides';
import { pox5PrivateNetworkHandlers } from './hiro.so/pox5-private-network';
import {
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
  blockTimesHandler,
  getAllowanceContractCallersHandlers,
  accountsBalanceStxHandler,
  poolsHandler,
  tokenHandler,
];

export const successHandlers = [
  ...pox5MockOverrideHandlers,
  ...[...endpoints, ...pox5PrivateNetworkHandlers].map(endpoint =>
    http[endpoint.method](endpoint.path, async () => delayedJsonResponse(endpoint.resp))
  ),
  ...multisigHandlers,
];
