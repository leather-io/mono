import { calculateDefaultStacksFee } from '@/features/send/utils';
import { t } from '@lingui/core/macro';
import { bytesToHex } from '@noble/hashes/utils';
import { StacksNetwork } from '@stacks/network';
import {
  ContractCallPayload,
  PayloadType,
  PayloadWire,
  SmartContractPayloadWire,
  StacksTransactionWire,
  TokenTransferPayloadWire,
  VersionedSmartContractPayloadWire,
  addressToString,
  cvToString,
} from '@stacks/transactions';

import { FeeTypes } from '@leather.io/models';
import { StacksSigner, createTransferSip10TxHex } from '@leather.io/stacks';
import {
  AnimalChameleonIcon,
  AnimalEagleIcon,
  AnimalRabbitIcon,
  AnimalSnailIcon,
} from '@leather.io/ui/native';
import { convertToMoneyTypeWithDefaultOfZero, createMoneyFromDecimal } from '@leather.io/utils';

function getBaseFeeData(feeType: FeeTypes) {
  const icon = {
    [FeeTypes.Low]: <AnimalSnailIcon />,
    [FeeTypes.Middle]: <AnimalRabbitIcon />,
    [FeeTypes.High]: <AnimalEagleIcon />,
    [FeeTypes.Custom]: <AnimalChameleonIcon />,
    [FeeTypes.Unknown]: <AnimalChameleonIcon />,
  }[feeType];

  const title = {
    [FeeTypes.Low]: t`Slow`,
    [FeeTypes.Middle]: t`Standard`,
    [FeeTypes.High]: t`Fast`,
    [FeeTypes.Custom]: t`Custom`,
    [FeeTypes.Unknown]: t`Unknown`,
  }[feeType];
  return { icon, title };
}

export function getBitcoinFeeData(feeType: FeeTypes) {
  const { icon, title } = getBaseFeeData(feeType);
  const time = {
    [FeeTypes.Low]: t`~1 hour+`,
    [FeeTypes.Middle]: t`~30 min`,
    [FeeTypes.High]: t`~10 – 20min`,
    [FeeTypes.Custom]: t`Custom`,
    [FeeTypes.Unknown]: t`Unknown`,
  }[feeType];
  return { icon, title, time };
}

export function getStacksFeeData(feeType: FeeTypes) {
  const { icon, title } = getBaseFeeData(feeType);
  const time = {
    [FeeTypes.Low]: t`1–2 minutes`,
    [FeeTypes.Middle]: t`20–30 seconds`,
    [FeeTypes.High]: t`10 seconds`,
    [FeeTypes.Custom]: t`Custom`,
    [FeeTypes.Unknown]: t`Unknown`,
  }[feeType];
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
): asserts payload is SmartContractPayloadWire | VersionedSmartContractPayloadWire {
  if (
    payload.payloadType !== PayloadType.VersionedSmartContract &&
    payload.payloadType !== PayloadType.SmartContract
  )
    throw new Error('This component should only be used for contract deploys');
}

export function isTokenTransfer(payload: PayloadWire): payload is TokenTransferPayloadWire {
  return payload.payloadType === PayloadType.TokenTransfer;
}
export function isContractCall(payload: PayloadWire): payload is ContractCallPayload {
  return payload.payloadType === PayloadType.ContractCall;
}
export function isContractDeploy(
  payload: PayloadWire
): payload is VersionedSmartContractPayloadWire | SmartContractPayloadWire {
  return (
    payload.payloadType === PayloadType.SmartContract ||
    payload.payloadType === PayloadType.VersionedSmartContract
  );
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

export function getDefaultFee() {
  const defaultFee = calculateDefaultStacksFee();
  return createMoneyFromDecimal(defaultFee, 'STX');
}

export function getTransferSip10TxHex(props: {
  signer: StacksSigner;
  assetId: string;
  recipient: string;
  amount: number;
  nonce: number;
  network: StacksNetwork;
  memo?: string;
}) {
  const fee = getDefaultFee();
  return createTransferSip10TxHex({ ...props, fee });
}
