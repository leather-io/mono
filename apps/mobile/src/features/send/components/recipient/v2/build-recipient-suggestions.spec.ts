import {
  BuildRecipientSuggestionsParams,
  buildRecipientSuggestions,
} from '@/features/send/components/recipient/v2/build-recipient-suggestions';
import { Account, deserializeAccountId } from '@/store/accounts/accounts';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { isShallowEqual } from 'remeda';
import { assert, describe, expect, it, vi } from 'vitest';

import { btcCryptoAsset } from '@leather.io/constants';
import { SendAssetActivity } from '@leather.io/models';

// One of the imports references @lingui/macro, causing compile-time errors.
vi.mock('@lingui/macro', () => ({}));

function createAccount(id: string, name: string): Account {
  return {
    id,
    name,
    ...deserializeAccountId(id),
    status: 'active',
    icon: 'pizza',
  };
}

interface CreateActivityParams {
  id: string;
  receiver: string;
  accountId?: string;
  timestamp?: [number, dayjs.ManipulateType];
}

function createActivityItem({
  id,
  accountId = 'fp1/0',
  receiver,
  timestamp = [1, 'day'],
}: CreateActivityParams): SendAssetActivity {
  return {
    type: 'sendAsset',
    txid: id,
    asset: btcCryptoAsset,
    receivers: [receiver],
    timestamp: dayjs()
      .subtract(...timestamp)
      .unix(),
    amount: BigNumber(3),
    status: 'success',
    level: 'account',
    account: deserializeAccountId(accountId),
  };
}

const testAccounts = [
  createAccount('fp1/0', 'Account 1'),
  createAccount('fp1/1', 'Account 2'),
  createAccount('fp1/2', 'Account 3'),
];

const testActivity = [
  createActivityItem({ id: 'tx1', receiver: 'address-1' }),
  createActivityItem({ id: 'tx2', receiver: 'address-2' }),
  createActivityItem({ id: 'tx3', receiver: 'address-3' }),
  createActivityItem({ id: 'tx4', receiver: 'address-4' }),
  createActivityItem({ id: 'tx5', receiver: 'address-5' }),
];

const selectedAccount = testAccounts[0];

function invokeWithDefaults(overrides: Partial<BuildRecipientSuggestionsParams> = {}) {
  assert(selectedAccount);
  return buildRecipientSuggestions({
    searchTerm: '',
    accounts: testAccounts,
    selectedAccount,
    activity: testActivity,
    canSelfSend: true,
    findAccountByAddress: callbackReturns(null),
    getAddressByAccount: callbackReturns('address'),
    performBnsLookup: callbackReturns(Promise.resolve(null)),
    validateAddress: callbackReturns(Promise.resolve(false)),
    ...overrides,
  });
}

describe('with empty search term', () => {
  it('returns recents section when there is activity', async () => {
    const sections = await invokeWithDefaults();
    assert(sections[0]);
    expect(sections[0].id).toBe('recents');
  });

  it('transforms activity into recent entries with correct properties', async () => {
    const activity = [createActivityItem({ id: 'tx1', receiver: 'address-1' })];
    const expectedEntry = { type: 'external', id: 'tx1', address: 'address-1' };
    const sections = await invokeWithDefaults({
      activity,
    });
    assert(sections[0]);
    expect(sections[0].data).toEqual([expectedEntry]);
  });

  it('limits recent suggestions to four items', async () => {
    const sections = await invokeWithDefaults();
    assert(sections[0]);
    expect(sections[0].id).toBe('recents');
    expect(sections[0].data).toHaveLength(4);
  });

  it('excludes own accounts from recents', async () => {
    const activity = [
      createActivityItem({ id: 'tx1', receiver: 'address-1' }),
      createActivityItem({ id: 'tx2', receiver: 'address-2' }),
    ];
    const accounts = [createAccount('fp/0', 'Account 1'), createAccount('fp/1', 'Account 2')];
    assert(activity[0]);
    assert(activity[1]);

    function findAccountByAddress(address: string) {
      assert(accounts[0]);
      return address === 'address-1' ? accounts[0] : null;
    }

    const sections = await invokeWithDefaults({ activity, accounts, findAccountByAddress });
    assert(sections[0]);
    expect(sections[0].data).toHaveLength(1);
    expect(sections[0].data).toEqual([
      {
        type: 'external',
        id: 'tx2',
        address: 'address-2',
      },
    ]);
  });

  it('returns accounts sections', async () => {
    const sections = await invokeWithDefaults();
    assert(sections[1]);
    expect(sections[1].id).toBe('accounts');
  });

  it('transforms activity into recent entries with correct properties', async () => {
    const account = createAccount('fp/0', 'Account 1');
    const expectedEntry = { type: 'internal', id: 'fp/0', address: 'address', rawAccount: account };
    const sections = await invokeWithDefaults({
      accounts: [account],
    });
    assert(sections[1]);
    expect(sections[1].data).toEqual([expectedEntry]);
  });

  it('excludes the current account when self send is disabled', async () => {
    const accounts = [createAccount('fp/0', 'Account 1'), createAccount('fp/1', 'Account 2')];
    assert(accounts[0]);
    assert(accounts[1]);
    const sections = await invokeWithDefaults({
      accounts,
      selectedAccount: accounts[0],
      canSelfSend: false,
    });
    assert(sections[1]);
    expect(sections[1].id).toBe('accounts');
    expect(sections[1].data).not.toContainEqual(
      expect.objectContaining({ type: 'internal', id: accounts[0].id })
    );
  });

  it('excludes sections without entries', async () => {
    const sections = await invokeWithDefaults({ accounts: [] });
    assert(sections[0]);
    expect(sections[0].id).toBe('recents');
    expect(sections[1]).toBeUndefined();
  });
});

describe('with search term', () => {
  it('returns a single suggestion when supplied with a new valid address', async () => {
    const address = 'valid-address';
    const sections = await invokeWithDefaults({
      searchTerm: address,
      validateAddress: () => Promise.resolve(true),
    });
    assert(sections[0]);
    expect(sections[0].id).toBe('matching');
    expect(sections[0].data).toHaveLength(1);
    expect(sections[0].data).toContainEqual({
      type: 'external',
      address: address,
      id: address,
    });
  });

  it('matches accounts by name', async () => {
    const accounts = [
      createAccount('fp/0', 'Account 1'),
      createAccount('fp/1', 'Account 2'),
      createAccount('fp/2', 'Random name'),
    ];
    const sections = await invokeWithDefaults({ searchTerm: 'account', accounts });
    assert(sections[0]);
    expect(sections[0].id).toBe('matching');
    expect(sections[0].data).toHaveLength(2);
    expect(
      sections[0].data.every(
        entry => entry.type === 'internal' && entry.rawAccount.name.startsWith('Account')
      )
    ).toBe(true);
  });

  it('matches accounts by address', async () => {
    const sampleAddress = 'abc';
    const accounts = [createAccount('fp/0', 'Account 1'), createAccount('fp/1', 'Account 2')];
    assert(accounts[0]);

    function getAddressByAccount(inputFingerPrint: string, inputAccountIndex: number) {
      assert(accounts[0]);
      const { fingerprint, accountIndex } = accounts[0];
      if (
        isShallowEqual(
          { fingerprint, accountIndex },
          { fingerprint: inputFingerPrint, accountIndex: inputAccountIndex }
        )
      ) {
        return sampleAddress;
      }

      return '';
    }
    const sections = await invokeWithDefaults({
      searchTerm: sampleAddress,
      accounts,
      getAddressByAccount,
    });
    assert(sections[0]);
    expect(sections[0].id).toBe('matching');
    expect(sections[0].data).toHaveLength(1);
    expect(sections[0].data).toContainEqual({
      type: 'internal',
      id: accounts[0].id,
      address: sampleAddress,
      rawAccount: accounts[0],
    });
  });

  it('matches recents by address', async () => {
    const activity = [
      createActivityItem({ id: 'tx1', receiver: 'abc-1' }),
      createActivityItem({ id: 'tx2', receiver: 'abc-2' }),
      createActivityItem({ id: 'tx2', receiver: 'xyz-3' }),
    ];
    const sections = await invokeWithDefaults({ searchTerm: 'abc', activity });
    assert(sections[0]);
    expect(sections[0].id).toBe('matching');
    expect(sections[0].data).toHaveLength(2);
    expect(sections[0].data).toContainEqual({ type: 'external', id: 'tx1', address: 'abc-1' });
    expect(sections[0].data).toContainEqual({ type: 'external', id: 'tx2', address: 'abc-2' });
  });

  it('returns a matching entry for a valid, resolvable BNS name', async () => {
    const bnsName = 'test.bns';
    const resolvedAddress = 'address';
    const sections = await invokeWithDefaults({
      searchTerm: bnsName,
      performBnsLookup: () => Promise.resolve(resolvedAddress),
    });
    assert(sections[0]);
    expect(sections[0].id).toBe('matching');
    expect(sections[0].data).toHaveLength(1);
    expect(sections[0].data).toContainEqual({
      type: 'external',
      id: resolvedAddress,
      address: resolvedAddress,
      bnsName: bnsName,
    });
  });
});

function callbackReturns<T>(value: T) {
  return vi.fn(() => value);
}
