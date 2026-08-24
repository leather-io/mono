import { createMarketData, createMarketPair } from '@leather.io/models';
import { ensurePostConditionWireFormat } from '@leather.io/stacks';
import { createMoney, createMoneyFromDecimal } from '@leather.io/utils';

import { makeFtPostCondition } from '@shared/utils/post-conditions';

import type { Fee } from '@app/features/fee-editor/fee-editor.context';

export const previewRequester = 'https://app.example.com';

export const previewAccountAddress = 'SPS8CKF63P16J28AYF7PXW9E5AACH0NZNTEFWSFE';
const previewRecipientAddress = 'SPXH3HNBPM5YP15VH16ZXZ9AX6CK289K3MCXRKCB';
export const previewMultisigAddress = 'SM2TBKGDZ6BKYM21NJ91F2JAA0MMCT41N8KSJB8E4';

const stxPriceInUsd = 2;

export const previewMarketData = createMarketData(
  createMarketPair('STX', 'USD'),
  createMoneyFromDecimal(stxPriceInUsd, 'USD')
);

export function previewConvertToFiat(value: { amount: { toNumber(): number } }) {
  return createMoneyFromDecimal(value.amount.toNumber() * stxPriceInUsd, 'USD');
}

export const previewFee: Fee = {
  priority: 'standard',
  txFee: createMoneyFromDecimal(0.0018, 'STX'),
  time: '20–30 seconds',
};

export const previewSponsoredFee: Fee = {
  priority: 'standard',
  txFee: createMoney(0, 'STX'),
  time: '20–30 seconds',
};

export const previewNonce = 41;

const previewSmallAmount = createMoneyFromDecimal(1.5, 'STX');

// The amount from the rounding case: displays as "1.23M STX" today
const previewLargeAmount = createMoneyFromDecimal(1234999, 'STX');

export const previewSmallRecipients = [
  { address: previewRecipientAddress, amount: previewSmallAmount },
];

export const previewLargeRecipients = [
  { address: previewRecipientAddress, amount: previewLargeAmount },
];

export const previewPostConditions = [
  ensurePostConditionWireFormat(
    makeFtPostCondition({
      amount: '1500000',
      contractAddress: 'SP3D6PV2ACBPEKYJTCMH7HEN02KP87QSP8KTEH335',
      contractAssetName: 'alex',
      contractName: 'token-alex',
      stxAddress: previewAccountAddress,
    })
  ),
];

export const previewContractCall = {
  contractAddress: 'SP000000000000000000002Q6VF78',
  contractName: 'bns',
  functionName: 'name-transfer',
  functionArgs: [
    '0200000002696', // namespace
    '020000000474657374', // name
  ],
};

export const previewContractDeploy = {
  address: previewAccountAddress,
  contractName: 'rewards-v3',
  codeBody: `(define-public (claim-all (amount uint))
  (begin
    (try! (contract-call? .vault withdraw amount))
    (ok true)))

(define-read-only (get-balance (who principal))
  (default-to u0 (map-get? balances who)))`,
};

export const previewBalance = createMoneyFromDecimal(13.568037, 'STX');
export const previewFiatBalance = createMoneyFromDecimal(27.14, 'USD');
export const previewMultisigBalance = createMoneyFromDecimal(18400000, 'STX');
export const previewMultisigFiatBalance = createMoneyFromDecimal(36800000, 'USD');
