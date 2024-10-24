import { getChainName } from './get-chain-name';

describe('getChainName', () => {
  it('should return an empty string for Stacks blockchain', () => {
    expect(getChainName('Stacks blockchain')).toBe('');
  });

  it('should return an empty string for Bitcoin blockchain', () => {
    expect(getChainName('Bitcoin blockchain')).toBe('');
  });

  it('should return the input chain name for other chains', () => {
    expect(getChainName('Ethereum')).toBe('Ethereum');
    expect(getChainName('Solana')).toBe('Solana');
  });

  it('should handle empty input', () => {
    expect(getChainName('')).toBe('');
  });

  it('should handle undefined input', () => {
    expect(getChainName(undefined as unknown as string)).toBe(undefined);
  });
});
