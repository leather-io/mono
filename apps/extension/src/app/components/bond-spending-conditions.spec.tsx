import { renderToString } from 'react-dom/server';

import {
  BondSpendingConditions,
  type BondSpendingDetails,
  formatVaultRequirement,
} from './bond-spending-conditions';

const reactTextSeparator = '<!-- -->';

const multisigVaultDetails: BondSpendingDetails = {
  unlockHeight: 1000,
  hash: 'ab'.repeat(32),
  counterpartyKey: 'xpub-counterparty-placeholder/0/0',
  vaultKind: 'multi',
  vaultThreshold: 2,
  vaultKeyExpressions: ['xpub-a/0/0', 'xpub-b/0/0', 'xpub-c/0/0'],
};

const singleKeyVaultDetails: BondSpendingDetails = {
  ...multisigVaultDetails,
  vaultKind: 'pk',
  vaultThreshold: 1,
  vaultKeyExpressions: ['xpub-owner-placeholder/0/0'],
};

const singleMemberVaultDetails: BondSpendingDetails = {
  ...multisigVaultDetails,
  vaultThreshold: 1,
  vaultKeyExpressions: ['xpub-a/0/0'],
};

function render(details: BondSpendingDetails) {
  return renderToString(<BondSpendingConditions details={details} />).replaceAll(
    reactTextSeparator,
    ''
  );
}

describe(BondSpendingConditions.name, () => {
  test('renders both spend paths with the counterparty key and hash', () => {
    const html = render(multisigVaultDetails);

    expect(html).toContain('From block 1000');
    expect(html).toContain('Requires 2 of 3 vault co-signers');
    expect(html).toContain('Before block 1000');
    expect(html).toContain('plus a signature from the counterparty key');
    expect(html).toContain(multisigVaultDetails.counterpartyKey);
    expect(html).toContain(multisigVaultDetails.hash);
    expect(html).not.toContain('Owner key');
  });

  test('describes a pk vault as an owner key and shows it', () => {
    const html = render(singleKeyVaultDetails);

    expect(html).toContain('Requires the owner key');
    expect(html).toContain('Owner key');
    expect(html).toContain('xpub-owner-placeholder/0/0');
    expect(html).not.toContain('vault co-signers');
  });

  test('keeps the vault wording for a 1 of 1 multisig vault', () => {
    const html = render(singleMemberVaultDetails);

    expect(html).toContain('Requires 1 of 1 vault co-signers');
    expect(html).not.toContain('Owner key');
  });
});

describe(formatVaultRequirement.name, () => {
  test('formats a multisig vault quorum', () => {
    expect(formatVaultRequirement(multisigVaultDetails)).toBe('2 of 3 vault co-signers');
    expect(formatVaultRequirement(singleMemberVaultDetails)).toBe('1 of 1 vault co-signers');
  });

  test('formats a pk vault as the owner key', () => {
    expect(formatVaultRequirement(singleKeyVaultDetails)).toBe('the owner key');
  });
});
