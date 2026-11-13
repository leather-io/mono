import type { ClarityAbi, ClarityAbiType } from '@stacks/transactions';
import { isDeepEqual } from 'remeda';

const sip9TransferArgTypes: ClarityAbiType[] = ['uint128', 'principal', 'principal'];

const lpTokenPatterns = [
  '::pool-token-id',
  '::lp-token',
  '::liquidity-token',
  '.dlmm-pool-',
  '.amm-pool-',
];

export function isLpToken(assetIdentifier: string): boolean {
  const lowerIdentifier = assetIdentifier.toLowerCase();
  return lpTokenPatterns.some(pattern => lowerIdentifier.includes(pattern));
}

export function isSip9TransferCompatible(contractInterface: ClarityAbi, assetName: string) {
  const nft = contractInterface.non_fungible_tokens.find(token => token.name === assetName);
  const transfer = contractInterface.functions.find(
    fn => fn.name === 'transfer' && fn.access === 'public'
  );
  return (
    nft?.type === 'uint128' &&
    isDeepEqual(
      transfer?.args.map(arg => arg.type),
      sip9TransferArgTypes
    )
  );
}
