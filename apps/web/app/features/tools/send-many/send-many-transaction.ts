import { useState } from 'react';

import {
  Pc,
  bufferCVFromString,
  contractPrincipalCV,
  listCV,
  noneCV,
  postConditionToWire,
  serializeCV,
  serializePostConditionWire,
  someCV,
  standardPrincipalCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';
import { analytics } from '~/utils/analytics/analytics';
import { type StxCallContractParams, leather } from '~/utils/leather-sdk';

import {
  SBTC_ASSET_NAME,
  SBTC_CONTRACT_ID,
  type SendManyToken,
  USDCX_ASSET_NAME,
  USDCX_CONTRACT_ID,
  sendManyTokens,
} from './send-many-constants';
import type { RecipientRow } from './send-many-schema';

function addressToCV(addr: string) {
  const parts = addr.split('.');
  if (parts.length === 2) {
    return contractPrincipalCV(parts[0], parts[1]);
  }
  return standardPrincipalCV(parts[0]);
}

function toSmallestUnit(amount: string, decimals: number): number {
  return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
}

function serializePostCondition(pc: ReturnType<typeof Pc.principal>) {
  return serializePostConditionWire(postConditionToWire(pc));
}

function buildStxContractCallParams(
  recipients: RecipientRow[],
  senderAddress: string
): StxCallContractParams {
  const config = sendManyTokens.stx;

  const entries = recipients.map(r =>
    tupleCV({
      to: addressToCV(r.address),
      ustx: uintCV(toSmallestUnit(r.amount, config.decimals)),
      memo: bufferCVFromString(r.memo ?? ''),
    })
  );

  const total = recipients.reduce((sum, r) => sum + toSmallestUnit(r.amount, config.decimals), 0);

  return {
    contract: config.contractId,
    functionName: config.functionName,
    functionArgs: [serializeCV(listCV(entries))],
    postConditions: [serializePostCondition(Pc.principal(senderAddress).willSendEq(total).ustx())],
    postConditionMode: 'deny',
    network: 'mainnet',
  };
}

function buildSbtcContractCallParams(
  recipients: RecipientRow[],
  senderAddress: string
): StxCallContractParams {
  const config = sendManyTokens.sbtc;

  const entries = recipients.map(r => {
    const hasMemo = r.memo && r.memo.length > 0;
    return tupleCV({
      to: addressToCV(r.address),
      sender: standardPrincipalCV(senderAddress),
      amount: uintCV(toSmallestUnit(r.amount, config.decimals)),
      memo: hasMemo ? someCV(bufferCVFromString(r.memo)) : noneCV(),
    });
  });

  const total = recipients.reduce((sum, r) => sum + toSmallestUnit(r.amount, config.decimals), 0);

  return {
    contract: config.contractId,
    functionName: config.functionName,
    functionArgs: [serializeCV(listCV(entries))],
    postConditions: [
      serializePostCondition(
        Pc.principal(senderAddress).willSendEq(total).ft(SBTC_CONTRACT_ID, SBTC_ASSET_NAME)
      ),
    ],
    postConditionMode: 'deny',
    network: 'mainnet',
  };
}

function buildUsdcContractCallParams(
  recipients: RecipientRow[],
  senderAddress: string
): StxCallContractParams {
  const config = sendManyTokens.usdc;

  const entries = recipients.map(r => {
    const hasMemo = r.memo && r.memo.length > 0;
    return tupleCV({
      to: addressToCV(r.address),
      amount: uintCV(toSmallestUnit(r.amount, config.decimals)),
      memo: hasMemo ? someCV(bufferCVFromString(r.memo)) : noneCV(),
    });
  });

  const total = recipients.reduce((sum, r) => sum + toSmallestUnit(r.amount, config.decimals), 0);

  return {
    contract: config.contractId,
    functionName: config.functionName,
    functionArgs: [serializeCV(listCV(entries))],
    postConditions: [
      serializePostCondition(
        Pc.principal(senderAddress).willSendEq(total).ft(USDCX_CONTRACT_ID, USDCX_ASSET_NAME)
      ),
    ],
    postConditionMode: 'deny',
    network: 'mainnet',
  };
}

function buildSendManyParams(
  token: SendManyToken,
  recipients: RecipientRow[],
  senderAddress: string
): StxCallContractParams {
  switch (token) {
    case 'sbtc':
      return buildSbtcContractCallParams(recipients, senderAddress);
    case 'usdc':
      return buildUsdcContractCallParams(recipients, senderAddress);
    case 'stx':
      return buildStxContractCallParams(recipients, senderAddress);
    default:
      throw new Error(`Unsupported token: ${token}`);
  }
}

interface SendManyResult {
  txid: string;
  transaction: string;
}

export function useSendManyAction() {
  const [result, setResult] = useState<SendManyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitSendMany(
    token: SendManyToken,
    recipients: RecipientRow[],
    senderAddress: string
  ) {
    setLoading(true);
    setError(null);
    try {
      const params = buildSendManyParams(token, recipients, senderAddress);
      const response = await leather.stxCallContract(params);
      setResult(response);
      analytics.untypedTrack('form_submit_send_many_success', {
        token,
        recipientCount: recipients.length,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Transaction failed';
      setError(message);
      analytics.untypedTrack('send_many_submit_error', {
        token,
        recipientCount: recipients.length,
        error: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return { result, error, loading, submitSendMany };
}
