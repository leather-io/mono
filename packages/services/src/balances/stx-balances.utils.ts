import { Money, StacksTx } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

export function calculateInboundStxBalance(
  address: string,
  pendingTransactions: StacksTx[]
): Money {
  // only include token transfers to address
  return createMoney(
    pendingTransactions.reduce(
      (balance, tx) =>
        tx.tx_type === 'token_transfer' && tx.token_transfer?.recipient_address === address
          ? balance + Number(tx.token_transfer.amount)
          : balance,
      0
    ),
    'STX'
  );
}

export function calculateOutboundStxBalance(
  address: string,
  pendingTransactions: StacksTx[]
): Money {
  // includes transfers and fees when address is the sender
  return createMoney(
    pendingTransactions.reduce((amount, tx) => {
      if (tx.sender_address === address) {
        if (tx.tx_type === 'token_transfer') {
          amount += Number(tx.token_transfer?.amount ?? 0);
        }
        if (!tx.sponsored) {
          amount += Number(tx.fee_rate);
        }
      }
      return amount;
    }, 0),
    'STX'
  );
}
