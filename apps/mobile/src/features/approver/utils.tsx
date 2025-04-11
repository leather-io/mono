import { useMemo } from 'react';

import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings.read';
import { t } from '@lingui/macro';
import { bytesToHex } from '@noble/hashes/utils';
import { StacksNetwork } from '@stacks/network';
import {
  ContractCallPayload,
  PayloadType,
  PayloadWire,
  StacksTransactionWire,
  TokenTransferPayloadWire,
  VersionedSmartContractPayloadWire,
  addressToString,
  cvToString,
} from '@stacks/transactions';

import { FeeTypes } from '@leather.io/models';
import { StacksSigner } from '@leather.io/stacks';
import {
  AnimalChameleonIcon,
  AnimalEagleIcon,
  AnimalRabbitIcon,
  AnimalSnailIcon,
} from '@leather.io/ui/native';
import { convertToMoneyTypeWithDefaultOfZero, match } from '@leather.io/utils';

export type ApproverState = 'start' | 'submitting' | 'submitted';

function getBaseFeeData(feeType: FeeTypes) {
  const icon = {
    [FeeTypes.Low]: <AnimalSnailIcon />,
    [FeeTypes.Middle]: <AnimalRabbitIcon />,
    [FeeTypes.High]: <AnimalEagleIcon />,
    [FeeTypes.Custom]: <AnimalChameleonIcon />,
    [FeeTypes.Unknown]: <AnimalChameleonIcon />,
  }[feeType];

  const title = {
    [FeeTypes.Low]: t({
      id: 'approver.fee.type.low',
      message: 'Slow',
    }),
    [FeeTypes.Middle]: t({
      id: 'approver.fee.type.middle',
      message: 'Standard',
    }),
    [FeeTypes.High]: t({
      id: 'approver.fee.type.high',
      message: 'Fast',
    }),
    [FeeTypes.Custom]: t({
      id: 'approver.fee.type.custom',
      message: 'Custom',
    }),
    [FeeTypes.Unknown]: t({
      id: 'approver.fee.type.unknown',
      message: 'Unknown',
    }),
  }[feeType];
  return { icon, title };
}

export function getBitcoinFeeData(feeType: FeeTypes) {
  const { icon, title } = getBaseFeeData(feeType);
  const time = {
    [FeeTypes.Low]: t({
      id: 'approver.bitcoin.fee.speed.low',
      message: '~40 mins',
    }),
    [FeeTypes.Middle]: t({
      id: 'approver.bitcoin.fee.speed.middle',
      message: '~20 mins',
    }),
    [FeeTypes.High]: t({
      id: 'approver.bitcoin.fee.speed.high',
      message: '~10 mins',
    }),
    [FeeTypes.Custom]: t({
      id: 'approver.fee.speed.custom',
      message: 'Custom',
    }),
    [FeeTypes.Unknown]: t({
      id: 'approver.fee.speed.unknown',
      message: 'Unknown',
    }),
  }[feeType];
  return { icon, title, time };
}

export function getStacksFeeData(feeType: FeeTypes) {
  const feeMatcher = match<FeeTypes>();
  const { icon, title } = getBaseFeeData(feeType);
  const time = feeMatcher(feeType, {
    [FeeTypes.Low]: t({
      id: 'approver.stacks.fee.speed.low',
      message: '~40 mins',
    }),
    [FeeTypes.Middle]: t({
      id: 'approver.stacks.fee.speed.middle',
      message: '~20 mins',
    }),
    [FeeTypes.High]: t({
      id: 'approver.stacks.fee.speed.high',
      message: '~10 mins',
    }),
    [FeeTypes.Custom]: t({
      id: 'approver.fee.speed.custom',
      message: 'Custom',
    }),
    [FeeTypes.Unknown]: t({
      id: 'approver.fee.speed.unknown',
      message: 'Unknown',
    }),
  });
  return {
    icon,
    title,
    time,
  };
}

export function getTxRecipient(payload: TokenTransferPayloadWire) {
  return cvToString(payload.recipient);
}

export function getTotalSpendMoney(payload: TokenTransferPayloadWire, fee: bigint) {
  return convertToMoneyTypeWithDefaultOfZero('STX', Number(payload.amount + fee));
}

export function getTxFeeMoney(tx: StacksTransactionWire) {
  return convertToMoneyTypeWithDefaultOfZero('STX', Number(tx.auth.spendingCondition.fee));
}

export function getContractAddress(payload: ContractCallPayload) {
  return addressToString(payload.contractAddress);
}

export function assertTokenTransferPayload(
  payload: PayloadWire
): asserts payload is TokenTransferPayloadWire {
  if (payload.payloadType !== PayloadType.TokenTransfer)
    throw new Error('This component should only be used for token transfers');
}
export function assertContractCallPayload(
  payload: PayloadWire
): asserts payload is ContractCallPayload {
  if (payload.payloadType !== PayloadType.ContractCall)
    throw new Error('This component should only be used for contract calls');
}
export function assertContractDeployPayload(
  payload: PayloadWire
): asserts payload is VersionedSmartContractPayloadWire {
  if (payload.payloadType !== PayloadType.VersionedSmartContract)
    throw new Error('This component should only be used for contract deploys');
}

export interface TxOptions {
  publicKey: string;
  network: StacksNetwork;
}

export function getTxOptions(signer: StacksSigner, stacksNetwork: StacksNetwork): TxOptions {
  return {
    publicKey: bytesToHex(signer.publicKey),
    network: stacksNetwork,
  };
}

export function useTxOptions(signer: StacksSigner): TxOptions {
  const stacksNetwork = useNetworkPreferenceStacksNetwork();

  return useMemo(() => getTxOptions(signer, stacksNetwork), [signer, stacksNetwork]);
}
