import { getPsbtDetails, psbtBase64ToHex } from '@leather.io/bitcoin';
import type { AuthNetworkId, Money, MultisigTransaction, VaultAccount } from '@leather.io/models';
import { decodeStxTransactionPayload } from '@leather.io/stacks';
import { assertUnreachable, createMoney } from '@leather.io/utils';

import { resolveBtcNetworkMode } from '../network/resolve-btc-network-mode';

interface ProposalSummary {
  recipient?: string;
  amount?: Money;
  fee?: Money;
}

export interface ProposalPayloadContext {
  network: AuthNetworkId;
  multisigAddress: string;
}

export type DecodedProposalPayload =
  | { type: 'btcTransfer'; recipient?: string; amount?: Money; fee?: Money }
  | { type: 'stxTransfer'; recipient: string; amount: Money; fee: Money }
  | { type: 'contractCall'; contractId: string; functionName: string; fee: Money }
  | { type: 'contractDeploy'; contractId: string; fee: Money };

export function decodeProposalPayload(
  context: ProposalPayloadContext,
  rawPayload: string
): DecodedProposalPayload | null {
  try {
    if (context.network.startsWith('btc')) {
      const networkMode = resolveBtcNetworkMode(context.network);
      const { psbtOutputs, fee } = getPsbtDetails({
        psbtHex: psbtBase64ToHex(rawPayload),
        psbtAddresses: [context.multisigAddress],
        networkMode,
      });
      const recipientOutput = psbtOutputs.find(
        output => output.address && output.address !== context.multisigAddress
      );
      return {
        type: 'btcTransfer',
        recipient: recipientOutput?.address ?? undefined,
        amount: recipientOutput ? createMoney(recipientOutput.value, 'BTC') : undefined,
        fee,
      };
    }
    const payload = decodeStxTransactionPayload(rawPayload);
    if (!payload) return null;
    const fee = createMoney(payload.fee, 'STX');
    switch (payload.type) {
      case 'stxTransfer':
        return {
          type: 'stxTransfer',
          recipient: payload.recipient,
          amount: createMoney(payload.amount, 'STX'),
          fee,
        };
      case 'contractCall':
        return {
          type: 'contractCall',
          contractId: `${payload.contractAddress}.${payload.contractName}`,
          functionName: payload.functionName,
          fee,
        };
      case 'contractDeploy':
        return {
          type: 'contractDeploy',
          contractId: `${context.multisigAddress}.${payload.contractName}`,
          fee,
        };
      default:
        return assertUnreachable(payload);
    }
  } catch {
    return null;
  }
}

// Decodes the recipient / amount / fee out of a proposed transaction's raw
// payload (BTC PSBT or serialized STX transfer). This is the only source of
// these values before broadcast, while the transaction is collecting
// signatures. Returns an empty summary if the payload can't be decoded.
export function decodeProposalSummary(
  account: VaultAccount,
  transaction: MultisigTransaction
): ProposalSummary {
  const payload = decodeProposalPayload(
    { network: account.network, multisigAddress: account.multisigAddress },
    transaction.proposalRawPayload
  );
  if (!payload) return {};
  switch (payload.type) {
    case 'btcTransfer':
    case 'stxTransfer':
      return { recipient: payload.recipient, amount: payload.amount, fee: payload.fee };
    case 'contractCall':
    case 'contractDeploy':
      return { fee: payload.fee };
    default:
      return assertUnreachable(payload);
  }
}
