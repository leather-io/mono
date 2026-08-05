import { makeStxDerivationPath, makeStxDerivationPathForType } from '@leather.io/stacks';

import {
  type HardwareStacksAccount,
  type SoftwareStacksAccount,
  getStacksAccountDerivationPath,
} from './stacks-account.models';

const fingerprint = 'e87a850b';
const stxPublicKey = '02b6b0afe5f620bc8e532b640b148dd9dea0ed19d11f8ab420fcce488fe3974893';

function makeLedgerAccount(derivationPath: string, accountIndex: number): HardwareStacksAccount {
  return {
    type: 'ledger',
    fingerprint,
    accountIndex,
    index: accountIndex,
    address: 'SP2G0KVR849MZHJ6YB4DCN8K5TRDVXF92A664PHXT',
    stxPublicKey,
    dataPublicKey: stxPublicKey,
    derivationPath,
  };
}

function makeSoftwareAccount(accountIndex: number): SoftwareStacksAccount {
  return {
    type: 'software',
    fingerprint,
    accountIndex,
    index: accountIndex,
    address: 'SP2G0KVR849MZHJ6YB4DCN8K5TRDVXF92A664PHXT',
    stxPublicKey,
    stxPrivateKey: '',
    dataPublicKey: stxPublicKey,
    dataPrivateKey: '',
    appsKey: '',
    salt: '',
  };
}

describe(getStacksAccountDerivationPath.name, () => {
  test('returns the stored ledgerLive path verbatim for a ledger account', () => {
    const ledgerLivePath = makeStxDerivationPathForType('ledgerLive', 2);
    const account = makeLedgerAccount(ledgerLivePath, 2);

    expect(getStacksAccountDerivationPath(account)).toBe(`m/44'/5757'/2'/0/0`);
    expect(getStacksAccountDerivationPath(account)).not.toBe(makeStxDerivationPath(2));
  });

  test('returns the stored standard path verbatim for a ledger account', () => {
    const standardPath = makeStxDerivationPathForType('stacks', 3);
    const account = makeLedgerAccount(standardPath, 3);

    expect(getStacksAccountDerivationPath(account)).toBe(`m/44'/5757'/0'/0/3`);
  });

  test('derives the standard path from accountIndex for a software account', () => {
    expect(getStacksAccountDerivationPath(makeSoftwareAccount(4))).toBe(`m/44'/5757'/0'/0/4`);
  });
});
