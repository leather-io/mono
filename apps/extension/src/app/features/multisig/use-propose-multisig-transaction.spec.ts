import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { AuthNetworkId } from '@leather.io/models';
import type { ProposeMultisigTransactionArgs } from '@leather.io/queries';

import { useProposeMultisigTransaction } from './use-propose-multisig-transaction';

interface MockMutationConfig {
  signProposalCommitment(network: AuthNetworkId, proposalHash: string): Promise<string>;
}

const mocks = vi.hoisted(() => ({
  signProposalCommitment: vi.fn(),
  reset: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useMutation({ mutationFn }: { mutationFn(args: unknown): Promise<unknown> }) {
    return { mutateAsync: mutationFn, reset: mocks.reset, isPending: false };
  },
}));

vi.mock('@leather.io/queries', () => ({
  createProposeMultisigTransactionMutationConfig({ signProposalCommitment }: MockMutationConfig) {
    return {
      async mutationFn({ network }: { network: AuthNetworkId }) {
        const proposalSignature = await signProposalCommitment(network, 'proposal-hash');
        return { id: 'proposal-1', proposalSignature };
      },
    };
  },
}));

vi.mock('./use-sign-proposal-commitment', () => ({
  useSignProposalCommitment: () => mocks.signProposalCommitment,
}));

const proposeArgs: ProposeMultisigTransactionArgs = {
  network: 'btc:testnet',
  multisigAddress: 'tb1qpolicyaddress',
  rawPayload: 'cHNidP8BAA==',
};

describe(useProposeMultisigTransaction.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('resolves with the proposal once the commitment is signed', async () => {
    mocks.signProposalCommitment.mockResolvedValue('signature');

    const proposal = await useProposeMultisigTransaction().proposeMultisigTransaction(proposeArgs);

    expect(mocks.signProposalCommitment).toHaveBeenCalledWith('btc:testnet', 'proposal-hash');
    expect(proposal).toEqual({ id: 'proposal-1', proposalSignature: 'signature' });
    expect(mocks.reset).not.toHaveBeenCalled();
  });

  test('resolves with null and resets the mutation when Ledger signing is dismissed', async () => {
    mocks.signProposalCommitment.mockResolvedValue(null);

    const proposal = await useProposeMultisigTransaction().proposeMultisigTransaction(proposeArgs);

    expect(proposal).toBeNull();
    expect(mocks.reset).toHaveBeenCalledOnce();
  });

  test('rethrows a failed commitment signing', async () => {
    const error = new Error('User cancelled the signing operation');
    mocks.signProposalCommitment.mockRejectedValue(error);

    await expect(
      useProposeMultisigTransaction().proposeMultisigTransaction(proposeArgs)
    ).rejects.toBe(error);
    expect(mocks.reset).not.toHaveBeenCalled();
  });
});
