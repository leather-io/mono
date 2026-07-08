import { getPsbtDetails, psbtBase64ToHex } from '@leather.io/bitcoin';
import type { Money, MultisigTransaction, VaultAccount } from '@leather.io/models';
import { decodeStxTransferPayload } from '@leather.io/stacks';
import { createMoney } from '@leather.io/utils';

import { resolveBtcNetworkMode } from '../network/resolve-btc-network-mode';

interface ProposalSummary {
  recipient?: string;
  amount?: Money;
  fee?: Money;
}

// Decodes the recipient / amount / fee out of a proposed transaction's raw
// payload (BTC PSBT or serialized STX transfer). This is the only source of
// these values before broadcast, while the transaction is collecting
// signatures. Returns an empty summary if the payload can't be decoded.
export function decodeProposalSummary(
  account: VaultAccount,
  transaction: MultisigTransaction
): ProposalSummary {
  try {
    if (account.network.startsWith('btc')) {
      const networkMode = resolveBtcNetworkMode(account.network);
      const { psbtOutputs, fee } = getPsbtDetails({
        psbtHex: psbtBase64ToHex(transaction.proposalRawPayload),
        psbtAddresses: [account.multisigAddress],
        networkMode,
      });
      const recipientOutput = psbtOutputs.find(
        output => output.address && output.address !== account.multisigAddress
      );
      return {
        recipient: recipientOutput?.address ?? undefined,
        amount: recipientOutput ? createMoney(recipientOutput.value, 'BTC') : undefined,
        fee,
      };
    }
    const transfer = decodeStxTransferPayload(transaction.proposalRawPayload);
    if (!transfer) return {};
    return {
      recipient: transfer.recipient,
      amount: createMoney(Number(transfer.amount), 'STX'),
      fee: createMoney(Number(transfer.fee), 'STX'),
    };
  } catch {
    return {};
  }
}
