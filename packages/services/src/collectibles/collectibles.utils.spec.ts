import type { ClarityAbi, ClarityAbiType } from '@stacks/transactions';

import { isLpToken, isSip9TransferCompatible } from './collectibles.utils';

describe(isLpToken.name, () => {
  it('returns true for pool-token-id pattern', () => {
    expect(isLpToken('SP123.velar-v1::pool-token-id')).toBe(true);
    expect(isLpToken('SP456.alex-amm::Pool-Token-Id')).toBe(true);
  });

  it('returns true for lp-token pattern', () => {
    expect(isLpToken('SP123.pool::lp-token')).toBe(true);
    expect(isLpToken('SP456.swap::LP-TOKEN')).toBe(true);
  });

  it('returns true for liquidity-token pattern', () => {
    expect(isLpToken('SP123.dex::liquidity-token')).toBe(true);
    expect(isLpToken('SP456.amm::Liquidity-Token')).toBe(true);
  });

  it('returns true for dlmm-pool- pattern', () => {
    expect(isLpToken('SP123.dlmm-pool-stx-usda::token')).toBe(true);
    expect(isLpToken('SP456.DLMM-POOL-BTC-STX::nft')).toBe(true);
  });

  it('returns true for amm-pool- pattern', () => {
    expect(isLpToken('SP123.amm-pool-v2::share')).toBe(true);
    expect(isLpToken('SP456.AMM-POOL-STX::token')).toBe(true);
  });

  it('returns false for regular NFT identifiers', () => {
    expect(isLpToken('SP123.megapont-ape-club::megapont-ape-club')).toBe(false);
    expect(isLpToken('SP456.bitcoin-monkeys::bitcoin-monkeys')).toBe(false);
    expect(isLpToken('SP789.stacks-punks::stacks-punks')).toBe(false);
  });

  it('returns false for BNS names', () => {
    expect(isLpToken('SP000.bns::names')).toBe(false);
    expect(isLpToken('SP123.bns-v2::bns-names')).toBe(false);
  });

  it('handles case insensitivity', () => {
    expect(isLpToken('SP123.VELAR::POOL-TOKEN-ID')).toBe(true);
    expect(isLpToken('sp123.velar::pool-token-id')).toBe(true);
    expect(isLpToken('Sp123.Velar::Pool-Token-Id')).toBe(true);
  });
});

describe(isSip9TransferCompatible.name, () => {
  function createContractInterface(
    transferArgTypes: ClarityAbiType[],
    nftType: ClarityAbiType
  ): ClarityAbi {
    return {
      functions: [
        {
          name: 'transfer',
          access: 'public',
          args: transferArgTypes.map((type, index) => ({ name: `arg-${index}`, type })),
          outputs: { type: 'bool' },
        },
      ],
      variables: [],
      maps: [],
      fungible_tokens: [],
      non_fungible_tokens: [{ name: 'my-nft', type: nftType }],
    };
  }

  it('returns true for a SIP-009 transfer and a uint token id', () => {
    const contractInterface = createContractInterface(
      ['uint128', 'principal', 'principal'],
      'uint128'
    );
    expect(isSip9TransferCompatible(contractInterface, 'my-nft')).toBe(true);
  });

  it('returns false for a non-uint token id', () => {
    const contractInterface = createContractInterface(['uint128', 'principal', 'principal'], {
      buffer: { length: 32 },
    });
    expect(isSip9TransferCompatible(contractInterface, 'my-nft')).toBe(false);
  });

  it('returns false for a transfer with other arguments', () => {
    const contractInterface = createContractInterface(['uint128', 'principal'], 'uint128');
    expect(isSip9TransferCompatible(contractInterface, 'my-nft')).toBe(false);
  });

  it('returns false when the asset is not in the contract', () => {
    const contractInterface = createContractInterface(
      ['uint128', 'principal', 'principal'],
      'uint128'
    );
    expect(isSip9TransferCompatible(contractInterface, 'other-nft')).toBe(false);
  });
});
