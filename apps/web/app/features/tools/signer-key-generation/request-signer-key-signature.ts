import { useState } from 'react';

import { IntegerType } from '@stacks/common';
import {
  Pox4SignatureTopic,
  pox4SignatureMessage,
  verifyPox4SignatureHash,
} from '@stacks/stacking';
import { cvToHex } from '@stacks/transactions';
import { leather } from '~/utils/leather-sdk';

export interface GenerateSignatureOptions {
  network: 'mainnet' | 'testnet';
  rewardCycle: number;
  poxAddress: string;
  period: number;
  method: Pox4SignatureTopic;
  maxAmount: IntegerType;
  authId: IntegerType;
}
async function requestStackingSignature(options: GenerateSignatureOptions) {
  const { message, domain } = pox4SignatureMessage({
    topic: options.method,
    period: options.period,
    network: options.network,
    rewardCycle: options.rewardCycle,
    poxAddress: options.poxAddress,
    maxAmount: options.maxAmount,
    authId: options.authId,
  });

  const signatureData = await leather.stxSignStructuredMessage({
    message: cvToHex(message),
    domain: cvToHex(domain),
  });

  const isValid = verifyPox4SignatureHash({
    topic: options.method,
    period: options.period,
    network: options.network,
    rewardCycle: options.rewardCycle,
    poxAddress: options.poxAddress,
    maxAmount: options.maxAmount,
    authId: options.authId,
    signature: signatureData.signature,
    publicKey: signatureData.publicKey,
  });

  return {
    ...signatureData,
    isValid,
    poxAddress: options.poxAddress,
    authId: options.authId,
    method: options.method,
    rewardCycle: options.rewardCycle,
  };
}

type SignerKeyResult = Awaited<ReturnType<typeof requestStackingSignature>>;

export function useSignerKeyAction() {
  const [result, setResult] = useState<SignerKeyResult | null>(null);

  async function requestSignerKey(options: GenerateSignatureOptions) {
    const response = await requestStackingSignature(options);
    setResult(response);
  }

  return { result, requestSignerKey };
}
