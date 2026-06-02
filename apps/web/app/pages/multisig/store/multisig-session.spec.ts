import { type MultisigSessionState, createInitialState, multisigReducer } from './multisig-session';

function seedState(): MultisigSessionState {
  return createInitialState();
}

describe('multisigReducer', () => {
  test('createInitialState seeds from the dummy data', () => {
    const state = seedState();
    expect(state.vaults.length).toBeGreaterThan(0);
    expect(state.vaults.find(v => v.id === 'treasury-stx')).toBeDefined();
  });

  test('addVault prepends a new pending vault that is retrievable by id', () => {
    const state = seedState();
    const next = multisigReducer(state, {
      type: 'addVault',
      payload: {
        chain: 'btc',
        name: 'Ops Reserve',
        theme: 2,
        members: [
          { addr: 'bc1qme', name: 'Me', isMe: true },
          { addr: 'bc1qother', name: 'Dana' },
        ],
      },
    });
    expect(next.vaults.length).toBe(state.vaults.length + 1);
    const created = next.vaults[0];
    expect(created.name).toBe('Ops Reserve');
    expect(created.status).toBe('pending');
    expect(created.members[0].isCreator).toBe(true);
    expect(created.members[1].inviteStatus).toBe('invited');
    expect(next.idSeq).toBe(state.idSeq + 1);
  });

  test('acceptInvite flips invited→false and status→active, leaving others unchanged', () => {
    const state = seedState();
    const next = multisigReducer(state, { type: 'acceptInvite', payload: { vaultId: 'invite-1' } });
    const accepted = next.vaults.find(v => v.id === 'invite-1');
    expect(accepted?.invited).toBe(false);
    expect(accepted?.status).toBe('active');
    // A different invited vault is untouched.
    expect(next.vaults.find(v => v.id === 'invite-2')?.invited).toBe(true);
  });

  test('declineInvite removes the vault', () => {
    const state = seedState();
    const next = multisigReducer(state, {
      type: 'declineInvite',
      payload: { vaultId: 'invite-2' },
    });
    expect(next.vaults.find(v => v.id === 'invite-2')).toBeUndefined();
  });

  test('proposeTransaction inserts a pending tx with required threshold from the account', () => {
    const state = seedState();
    const next = multisigReducer(state, {
      type: 'proposeTransaction',
      payload: {
        vaultId: 'treasury-stx',
        accountId: 'cold',
        recipient: 'alice.btc',
        amount: '100',
      },
    });
    const vault = next.vaults.find(v => v.id === 'treasury-stx');
    const tx = vault?.transactions[0];
    expect(tx?.status).toBe('pending');
    expect(tx?.required).toBe(2); // cold account threshold [2, 3]
    expect(tx?.signed).toEqual(['Me']);
    expect(tx?.amount).toBe('-100 STX');
  });

  test('signTransaction appends signer and advances to signed when threshold met', () => {
    const state = seedState();
    // tx-3 on treasury-stx has signed: [], required: 2.
    const afterFirst = multisigReducer(state, {
      type: 'signTransaction',
      payload: { vaultId: 'treasury-stx', txId: 'tx-3', signer: 'Me' },
    });
    const txAfterFirst = afterFirst.vaults
      .find(v => v.id === 'treasury-stx')
      ?.transactions.find(t => t.id === 'tx-3');
    expect(txAfterFirst?.signed).toEqual(['Me']);
    expect(txAfterFirst?.status).toBe('pending');

    const afterSecond = multisigReducer(afterFirst, {
      type: 'signTransaction',
      payload: { vaultId: 'treasury-stx', txId: 'tx-3', signer: 'Amber' },
    });
    const txAfterSecond = afterSecond.vaults
      .find(v => v.id === 'treasury-stx')
      ?.transactions.find(t => t.id === 'tx-3');
    expect(txAfterSecond?.signed).toEqual(['Me', 'Amber']);
    expect(txAfterSecond?.status).toBe('signed');
  });

  test('signTransaction does not double-add the same signer', () => {
    const state = seedState();
    const once = multisigReducer(state, {
      type: 'signTransaction',
      payload: { vaultId: 'treasury-stx', txId: 'tx-3', signer: 'Me' },
    });
    const twice = multisigReducer(once, {
      type: 'signTransaction',
      payload: { vaultId: 'treasury-stx', txId: 'tx-3', signer: 'Me' },
    });
    const tx = twice.vaults
      .find(v => v.id === 'treasury-stx')
      ?.transactions.find(t => t.id === 'tx-3');
    expect(tx?.signed).toEqual(['Me']);
  });

  test('addAccount appends an account with the chosen threshold over member count', () => {
    const state = seedState();
    const next = multisigReducer(state, {
      type: 'addAccount',
      payload: { vaultId: 'treasury-stx', name: 'DeFi', threshold: 2, icon: 'rocket' },
    });
    const vault = next.vaults.find(v => v.id === 'treasury-stx');
    const account = vault?.accounts.find(a => a.name === 'DeFi');
    expect(account).toBeDefined();
    expect(account?.threshold).toEqual([2, 3]); // 3 members
  });

  test('cancelVault cancels a pending vault and is a no-op for an active one', () => {
    const state = seedState();
    const cancelledPending = multisigReducer(state, {
      type: 'cancelVault',
      payload: { vaultId: 'invite-1' }, // pending
    });
    expect(cancelledPending.vaults.find(v => v.id === 'invite-1')?.status).toBe('cancelled');

    const noop = multisigReducer(state, {
      type: 'cancelVault',
      payload: { vaultId: 'treasury-stx' }, // active
    });
    expect(noop.vaults.find(v => v.id === 'treasury-stx')?.status).toBe('active');
  });

  test('reset to empty clears vaults; reset to seed restores them', () => {
    const state = seedState();
    const empty = multisigReducer(state, { type: 'reset', payload: 'empty' });
    expect(empty.vaults).toEqual([]);
    const reseeded = multisigReducer(empty, { type: 'reset', payload: 'seed' });
    expect(reseeded.vaults.length).toBe(state.vaults.length);
  });
});
