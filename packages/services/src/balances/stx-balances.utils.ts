import { type Money } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { type HiroPrincipalMempoolTransaction } from '../infrastructure/api/hiro/hiro-stacks-api.types';

export function calculateInboundStxBalance(
  address: string,
  pendingTransactions: HiroPrincipalMempoolTransaction[]
): Money {
  // only include token transfers to address
  return createMoney(
    pendingTransactions.reduce(
      (balance, tx) =>
        tx.type === 'token_transfer' && tx.token_transfer.recipient === address
          ? balance + Number(tx.token_transfer.amount)
          : balance,
      0
    ),
    'STX'
  );
}

export function calculateOutboundStxBalance(
  address: string,
  pendingTransactions: HiroPrincipalMempoolTransaction[]
): Money {
  // includes transfers and fees when address is the sender
  return createMoney(
    pendingTransactions.reduce((amount, tx) => {
      if (tx.sender.address === address) {
        if (tx.type === 'token_transfer') {
          amount += Number(tx.token_transfer.amount);
        }
        if (tx.sponsor === null) {
          amount += Number(tx.fee_rate);
        }
      }
      return amount;
    }, 0),
    'STX'
  );
}
