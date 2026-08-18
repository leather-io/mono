import { getPsbtDetails, psbtBase64ToHex } from '@leather.io/bitcoin';
import type { AuthNetworkId, Money, Sip10Asset } from '@leather.io/models';
import { decodeStxTransactionPayload } from '@leather.io/stacks';
import { assertUnreachable, createMoney } from '@leather.io/utils';

import { resolveBtcNetworkMode } from '../network/resolve-btc-network-mode';

interface ProposalTokenTransfer {
  contractId: string;
  assetName: string;
  baseUnitAmount: bigint;
}

export interface ProposalPayloadContext {
  network: AuthNetworkId;
  multisigAddress: string;
}

export function matchesProposalTokenAsset(asset: Sip10Asset, assetName: string): boolean {
  if (!asset.assetId.includes('::')) return true;
  return asset.assetId.endsWith(`::${assetName}`);
}

export type DecodedProposalPayload =
  | { type: 'btcTransfer'; recipient?: string; amount?: Money; fee?: Money }
  | { type: 'stxTransfer'; recipient: string; amount: Money; memo: string; fee: Money }
  | {
      type: 'sip10Transfer';
      token: ProposalTokenTransfer;
      sender: string;
      recipient: string;
      memo?: string;
      fee: Money;
    }
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
          memo: payload.memo,
          fee,
        };
      case 'sip10Transfer':
        if (payload.sender !== context.multisigAddress)
          return {
            type: 'contractCall',
            contractId: payload.contractId,
            functionName: 'transfer',
            fee,
          };
        return {
          type: 'sip10Transfer',
          token: {
            contractId: payload.contractId,
            assetName: payload.assetName,
            baseUnitAmount: payload.amount,
          },
          sender: payload.sender,
          recipient: payload.recipient,
          memo: payload.memo,
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
