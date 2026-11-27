import { type RequestHandler } from 'msw';

import { accountsScenarios } from './accounts';
import { coreScenarios } from './core';
import { homeScenarios } from './home';
import { rpcBitcoinScenarios } from './rpc-bitcoin';
import { rpcStacksScenarios } from './rpc-stacks';
import { sendScenarios } from './send';

export const scenarios: Record<string, RequestHandler[]> = {
  ...coreScenarios,
  ...homeScenarios,
  ...sendScenarios,
  ...accountsScenarios,
  ...rpcBitcoinScenarios,
  ...rpcStacksScenarios,
};
