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
  topic: Pox4SignatureTopic;
  maxAmount: IntegerType;
  authId: IntegerType;
}
export async function requestStackingSignature(options: GenerateSignatureOptions) {
  const { message, domain } = pox4SignatureMessage({
    topic: options.topic,
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
    topic: options.topic,
    period: options.period,
    network: options.network,
    rewardCycle: options.rewardCycle,
    poxAddress: options.poxAddress,
    maxAmount: options.maxAmount,
    authId: options.authId,
    signature: signatureData.signature,
    publicKey: signatureData.publicKey,
  });

  return { signatureData, isValid };
}
