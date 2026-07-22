import { describe, expect, it } from 'vitest';

import type {
  AuthNetworkId,
  MultisigTransactionSummary,
  StacksProtocol,
  VaultAccountSummary,
} from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import type { DecodedProposalPayload } from '../transactions/decode-proposal-summary';
import {
  type ContractActionTarget,
  buildClassifications,
  buildContractActionTargets,
  buildVaultMultisigTransactions,
  collectContractAddresses,
  decodeContractCallPayloads,
} from './build-multisig-activity-inputs';
import type { VaultMultisigTransaction } from './harmonize-vault-activity';

type DecodedContractCall = Extract<DecodedProposalPayload, { type: 'contractCall' }>;

const alexAddress = 'SP102V8P0F7JX67ARQ77WEA3D3CFB5XW39REDT0AM';
const velarAddress = 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1';
const multisigAddress = 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG';

const alexProtocol: StacksProtocol = {
  id: 'alex',
  name: 'ALEX',
  url: 'https://alexlab.co',
  logo: 'alex.png',
};

const velarProtocol: StacksProtocol = {
  id: 'velar',
  name: 'Velar',
  url: 'https://velar.co',
  logo: 'velar.png',
};

function makeContractCall(contractId: string, functionName: string): DecodedContractCall {
  return { type: 'contractCall', contractId, functionName, fee: createMoney(250, 'STX') };
}

function makeSummary(
  overrides: Partial<MultisigTransactionSummary> = {}
): MultisigTransactionSummary {
  return {
    id: 'tx-1',
    vaultAccountId: 'vault-account-1',
    network: 'stx:testnet',
    proposerUserId: 'user-1',
    proposalTimestamp: 1751000000,
    nonce: 0,
    txId: null,
    status: 'pending',
    broadcastAt: null,
    createdAt: '2026-06-27T00:00:00Z',
    updatedAt: '2026-06-27T00:00:00Z',
    approvalCount: 1,
    ...overrides,
  };
}

function makeAccount(overrides: Partial<VaultAccountSummary> = {}): VaultAccountSummary {
  return {
    id: 'account-1',
    vaultId: 'vault-1',
    name: 'Account 1',
    icon: null,
    network: 'stx:testnet',
    threshold: 2,
    multisigAddress,
    accountIndex: 0,
    createdAt: '2026-06-27T00:00:00Z',
    signerCount: 3,
    ...overrides,
  };
}

function makeVaultTx(
  network: AuthNetworkId,
  transaction: Partial<MultisigTransactionSummary> = {}
): VaultMultisigTransaction {
  return {
    transaction: makeSummary({ network, ...transaction }),
    payloadContext: { network, multisigAddress },
    vaultId: 'vault-1',
  };
}

describe(buildVaultMultisigTransactions.name, () => {
  it('pairs each account summary with its vault context', () => {
    const account = makeAccount({
      vaultId: 'vault-9',
      threshold: 3,
      multisigAddress: 'ST-multisig',
    });
    const summaries = [[makeSummary({ id: 'tx-a' }), makeSummary({ id: 'tx-b' })]];
    const names = new Map([['vault-9', 'Treasury']]);

    const result = buildVaultMultisigTransactions([account], summaries, names);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      transaction: { id: 'tx-a' },
      payloadContext: { network: 'stx:testnet', multisigAddress: 'ST-multisig' },
      vaultId: 'vault-9',
      vaultName: 'Treasury',
      threshold: 3,
    });
  });

  it('yields nothing for an account with no summaries', () => {
    expect(buildVaultMultisigTransactions([makeAccount()], [[]])).toEqual([]);
  });
});

describe(decodeContractCallPayloads.name, () => {
  it('skips bitcoin transactions', () => {
    const txs = [makeVaultTx('btc:mainnet')];

    expect(decodeContractCallPayloads(txs, new Map([['tx-1', 'psbt']]))).toEqual([]);
  });

  it('skips transactions with no fetched payload', () => {
    const txs = [makeVaultTx('stx:testnet')];

    expect(decodeContractCallPayloads(txs, new Map())).toEqual([]);
  });
});

describe(collectContractAddresses.name, () => {
  it('returns the unique set of contract addresses', () => {
    const calls = [
      makeContractCall(`${alexAddress}.amm-swap-pool`, 'swap-helper'),
      makeContractCall(`${alexAddress}.vault`, 'deposit'),
      makeContractCall(`${velarAddress}.univ2-core`, 'swap'),
    ];

    expect(collectContractAddresses(calls)).toEqual([alexAddress, velarAddress]);
  });
});

describe(buildContractActionTargets.name, () => {
  it('maps a contract call to its owning protocol', () => {
    const calls = [makeContractCall(`${alexAddress}.amm-swap-pool`, 'swap-helper')];
    const protocols = new Map([[alexAddress, alexProtocol]]);

    expect(buildContractActionTargets(calls, protocols)).toEqual([
      {
        key: `${alexAddress}.amm-swap-pool|swap-helper`,
        protocol: alexProtocol,
        contractName: 'amm-swap-pool',
        functionName: 'swap-helper',
      },
    ]);
  });

  it('deduplicates repeated contract-and-function pairs', () => {
    const calls = [
      makeContractCall(`${alexAddress}.amm-swap-pool`, 'swap-helper'),
      makeContractCall(`${alexAddress}.amm-swap-pool`, 'swap-helper'),
    ];
    const protocols = new Map([[alexAddress, alexProtocol]]);

    expect(buildContractActionTargets(calls, protocols)).toHaveLength(1);
  });

  it('keeps distinct functions on the same contract as separate targets', () => {
    const calls = [
      makeContractCall(`${velarAddress}.univ2-core`, 'swap-exact-tokens-for-tokens'),
      makeContractCall(`${velarAddress}.univ2-core`, 'add-liquidity'),
    ];
    const protocols = new Map([[velarAddress, velarProtocol]]);

    expect(buildContractActionTargets(calls, protocols).map(target => target.functionName)).toEqual(
      ['swap-exact-tokens-for-tokens', 'add-liquidity']
    );
  });

  it('drops calls whose address has no matching protocol', () => {
    const calls = [makeContractCall(`${alexAddress}.amm-swap-pool`, 'swap-helper')];
    const protocols = new Map<string, StacksProtocol | null>([[alexAddress, null]]);

    expect(buildContractActionTargets(calls, protocols)).toEqual([]);
  });

  it('drops calls with a malformed contract id', () => {
    const calls = [makeContractCall(alexAddress, 'swap-helper')];
    const protocols = new Map([[alexAddress, alexProtocol]]);

    expect(buildContractActionTargets(calls, protocols)).toEqual([]);
  });
});

describe(buildClassifications.name, () => {
  const targets: ContractActionTarget[] = [
    { key: 'alex|swap', protocol: alexProtocol, contractName: 'amm', functionName: 'swap' },
    {
      key: 'velar|deposit',
      protocol: velarProtocol,
      contractName: 'vault',
      functionName: 'deposit',
    },
  ];

  it('keys resolved actions by target', () => {
    const classifications = buildClassifications(targets, ['swap', 'deposit']);

    expect(classifications.get('alex|swap')).toEqual({
      action: 'swap',
      protocol: 'alex',
      protocolName: 'ALEX',
    });
  });

  it('infers the action from the function name when unresolved', () => {
    const classifications = buildClassifications(targets, ['swap', null]);

    expect(classifications.get('velar|deposit')).toEqual({
      action: 'deposit',
      protocol: 'velar',
      protocolName: 'Velar',
    });
  });

  it('prefers the more specific keyword when function names overlap (unstake vs stake)', () => {
    const unstakeTargets: ContractActionTarget[] = [
      {
        key: 'velar|unstake-lp',
        protocol: velarProtocol,
        contractName: 'farm',
        functionName: 'unstake-lp',
      },
    ];
    const classifications = buildClassifications(unstakeTargets, [null]);

    expect(classifications.get('velar|unstake-lp')?.action).toBe('unstake-lp');
  });

  it('falls back to contract-execution when the function name matches no convention', () => {
    const opaqueTargets: ContractActionTarget[] = [
      {
        key: 'velar|execute',
        protocol: velarProtocol,
        contractName: 'vault',
        functionName: 'execute',
      },
    ];
    const classifications = buildClassifications(opaqueTargets, [null]);

    expect(classifications.get('velar|execute')).toEqual({
      action: 'contract-execution',
      protocol: 'velar',
      protocolName: 'Velar',
    });
  });
});
