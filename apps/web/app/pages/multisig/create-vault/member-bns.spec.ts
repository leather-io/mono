import { describe, expect, it } from 'vitest';
import type { BnsResolution } from '~/queries/bns/bns.query';

import { looksLikeBnsName, reconcileMemberBns } from './member-bns';

const aliceAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
const bobAddress = 'SP3TBBQXBWFPFTP5X7KYQZ8N3G8ML0MBK5RJ5ZP2H';

function resolver(map: Record<string, BnsResolution>) {
  return (name: string) => map[name];
}

describe('looksLikeBnsName', () => {
  it('accepts label.namespace names, including subdomains', () => {
    expect(looksLikeBnsName('alice.btc')).toBe(true);
    expect(looksLikeBnsName('fyq.us20.btc')).toBe(true);
  });

  it('rejects addresses and plain names', () => {
    expect(looksLikeBnsName(aliceAddress)).toBe(false);
    expect(looksLikeBnsName('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4')).toBe(false);
    expect(looksLikeBnsName('Alice')).toBe(false);
    expect(looksLikeBnsName('alice.')).toBe(false);
    expect(looksLikeBnsName('')).toBe(false);
  });
});

describe('reconcileMemberBns', () => {
  it('passes through a plain address + name unchanged', () => {
    const r = reconcileMemberBns({ addr: aliceAddress, name: 'Alice' }, resolver({}));
    expect(r).toEqual({ addr: aliceAddress, name: 'Alice', bns: 'none' });
  });

  it('reports resolving while a BNS address field is in flight', () => {
    const r = reconcileMemberBns(
      { addr: 'alice.btc', name: '' },
      resolver({ 'alice.btc': { status: 'loading' } })
    );
    expect(r.bns).toBe('resolving');
  });

  it('reports not-found for an unknown BNS name', () => {
    const r = reconcileMemberBns(
      { addr: 'nope.btc', name: '' },
      resolver({ 'nope.btc': { status: 'not-found' } })
    );
    expect(r.bns).toBe('not-found');
  });

  it('fills the address and labels the name when a BNS is typed in the address field', () => {
    const r = reconcileMemberBns(
      { addr: 'alice.btc', name: '' },
      resolver({ 'alice.btc': { status: 'found', owner: aliceAddress } })
    );
    expect(r).toEqual({ addr: aliceAddress, name: 'alice.btc', bns: 'none' });
  });

  it('keeps a custom name when a BNS is typed in the address field', () => {
    const r = reconcileMemberBns(
      { addr: 'alice.btc', name: 'Work' },
      resolver({ 'alice.btc': { status: 'found', owner: aliceAddress } })
    );
    expect(r).toEqual({ addr: aliceAddress, name: 'Work', bns: 'none' });
  });

  it('fills an empty address from a BNS typed in the name field', () => {
    const r = reconcileMemberBns(
      { addr: '', name: 'alice.btc' },
      resolver({ 'alice.btc': { status: 'found', owner: aliceAddress } })
    );
    expect(r).toEqual({ addr: aliceAddress, name: 'alice.btc', bns: 'none' });
  });

  it('accepts a BNS name that verifies against the entered address', () => {
    const r = reconcileMemberBns(
      { addr: aliceAddress, name: 'alice.btc' },
      resolver({ 'alice.btc': { status: 'found', owner: aliceAddress } })
    );
    expect(r).toEqual({ addr: aliceAddress, name: 'alice.btc', bns: 'none' });
  });

  it('rejects a BNS name that does not match the entered address (spoof)', () => {
    const r = reconcileMemberBns(
      { addr: bobAddress, name: 'alice.btc' },
      resolver({ 'alice.btc': { status: 'found', owner: aliceAddress } })
    );
    expect(r.bns).toBe('mismatch');
    expect(r.addr).toBe(bobAddress);
  });
});
