import { Linking } from 'react-native';

import { TokenIcon } from '@/components/widgets/tokens/token-icon';
import { AddressTransactionWithTransfers } from '@stacks/stacks-blockchain-api-types';

import { BitcoinNetworkModes } from '@leather.io/models';
import { useCurrentNetworkState } from '@leather.io/query';

import { ActivityCell } from './activity-cell';
import { displayDate } from './transaction/date-utils';
import { getTransactionTime } from './transaction/transaction-list.utils';
import { makeStacksTxExplorerLink } from './utils/explorer-link';

interface StacksActivityCellProps {
  tx: AddressTransactionWithTransfers;
}
async function goToExplorer(tx: AddressTransactionWithTransfers, mode: BitcoinNetworkModes) {
  const url = makeStacksTxExplorerLink({
    mode,
    searchParams: undefined,
    // isNakamoto: false,
    txid: tx.tx_id,
  });
  return await Linking.openURL(url);
}

export function StacksActivityCell({ tx }: StacksActivityCellProps) {
  // need to show:
  // protocol
  // tx_status - mapped to our states - Sending, Sent, Confirmed, Received etc.
  // amount
  // convert amount to fiat - should be at time of transaction NOT now
  // date ?? (what date iso? )
  const txTime = getTransactionTime({ blockchain: 'stacks', transaction: tx });
  const date = displayDate(txTime);
  const { mode } = useCurrentNetworkState();
  return (
    <ActivityCell
      title="failed to send"
      icon={<TokenIcon ticker="STX" />}
      date={date || ''}
      amount="1"
      fiatAmount="$10,000"
      onPress={() => goToExplorer(tx, mode)}
    />
  );
}

// const tx = {
//   anchor_mode: 'any',
//   block_hash: '0x9eec840805c382e32fbaaff9c212ca21dea96932f5d22f829a941fa1c28eb7ee',
//   block_height: 165331,
//   block_time: 1725884075,
//   block_time_iso: '2024-09-09T12:14:35.000Z',
//   burn_block_height: 860605,
//   burn_block_time: 1725884034,
//   burn_block_time_iso: '2024-09-09T12:13:54.000Z',
//   canonical: true,
//   contract_call: {
//     contract_id: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.send-many-memo',
//     function_args: [[Object]],
//     function_name: 'send-many',
//     function_signature:
//       '(define-public (send-many (recipients (list 200 (tuple (memo (buff 34)) (to principal) (ustx uint))))))',
//   },
//   event_count: 400,
//   events: [],
//   execution_cost_read_count: 203,
//   execution_cost_read_length: 934,
//   execution_cost_runtime: 3331565,
//   execution_cost_write_count: 200,
//   execution_cost_write_length: 200,
//   fee_rate: '100000',
//   is_unanchored: false,
//   microblock_canonical: true,
//   microblock_hash: '0x',
//   microblock_sequence: 2147483647,
//   nonce: 322,
//   parent_block_hash: '0xdd1fbea866346c72b0da5e718b1d0167aa73e94eaab1631abfe55827fb9dc3a4',
//   parent_burn_block_time: 1725883931,
//   parent_burn_block_time_iso: '2024-09-09T12:12:11.000Z',
//   post_condition_mode: 'deny',
//   post_conditions: [
//     { amount: '9986628227', condition_code: 'sent_equal_to', principal: [Object], type: 'stx' },
//   ],
//   sender_address: 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP',
//   sponsor_address: 'SP1K1A1PMGW2ZJCNF46NWZWHG8TS1D23EGH1KNK60',
//   sponsor_nonce: 6502,
//   sponsored: true,
//   tx_id: '0xe631a3c2ddfded82aa30ba6640e29acf42d8d1bce032dd94d2e7dd7ddaf5aaf3',
//   tx_index: 21,
//   tx_result: { hex: 'redacted', repr: 'redacted' },
//   tx_status: 'success',
//   tx_type: 'contract_call',
// };
