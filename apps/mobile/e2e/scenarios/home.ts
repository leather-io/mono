import { type RequestHandler } from 'msw';

import {
  mixedInputSendTransactions,
  taprootOnlyReceiveTransactions,
  taprootOnlySendTransactions,
  unownedTransactions,
} from '../fixtures/home-bitcoin-activity';
import { bitcoinTransactionsHandlers } from '../handlers/leather-api';

export const homeScenarios: Record<string, RequestHandler[]> = {
  'activity-taproot-send': bitcoinTransactionsHandlers(taprootOnlySendTransactions),
  'activity-taproot-receive': bitcoinTransactionsHandlers(taprootOnlyReceiveTransactions),
  'activity-mixed-input-send': bitcoinTransactionsHandlers(mixedInputSendTransactions),
  'activity-owned-and-unowned': bitcoinTransactionsHandlers(descriptor => [
    ...taprootOnlySendTransactions(descriptor),
    ...unownedTransactions(),
  ]),
};
