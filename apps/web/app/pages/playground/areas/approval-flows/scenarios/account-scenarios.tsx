import { Flex, Stack, styled } from 'leather-styles/jsx';

import { AddressDisplayer, Avatar, KeyIcon } from '@leather.io/ui';

import { cautionShown, decided, viewed } from '../approval-flows.events';
import { ApprovalFooter } from '../pattern/approval-footer';
import { truncateMiddle } from '../pattern/approval-format';
import { ApprovalHeader } from '../pattern/approval-header';
import { AccountAvatar } from '../pattern/approval-identity';
import { ApprovalCaution, ApprovalCheck, ApprovalNote } from '../pattern/approval-notices';
import { ApprovalDisclosureRow, ApprovalRow } from '../pattern/approval-rows';
import { ApprovalIntent, ApprovalSection, ApprovalShell } from '../pattern/approval-shell';
import { approvalIconTile } from '../pattern/approval-surface';
import type { ApprovalAccount } from '../pattern/approval-types';
import {
  account1,
  account3,
  btcSigner,
  btcVaultAddress,
  leatherApp,
  mainnet,
  zest,
} from './fixtures';
import type { Scenario } from './scenario';

const vaultName = 'Team Treasury';
const vaultThreshold = '2 of 3';

const outsiderAccount: ApprovalAccount = {
  ...account3,
  address: 'bc1q9vza2e8x573nczrlzms0wvx3gsqjx7vavgkx0l',
};

interface PolicyKey {
  label: string;
  fingerprint: string;
  xpub: string;
}

const policyKeys: PolicyKey[] = [
  {
    label: 'Key 1',
    fingerprint: '73c5da0a',
    xpub: 'xpub6DkFAXWQ2dHxq2vatrt9qyA3bXYU4ToWQwCHbf5XB2mSTexcHZCeKS1VZYcPoBd5X8yVcbXFHJR9R8UCVpt82VX1VhR28mCyxUFL4r6KFrf',
  },
  {
    label: 'Key 2',
    fingerprint: 'f57ec65d',
    xpub: 'xpub6EHsNcrrxYdHXbQgjSzxQbxazDmWBXuVhQ7gTZx4cfmoJYLgCR3dyRNNH9sJgX7N3zmZmBd3vwEYfWJqHgB9cXYmzYd5YeHXyP4wqDRdZs7',
  },
  {
    label: 'Key 3',
    fingerprint: 'c2a49b17',
    xpub: 'xpub6BosfCnifzxcFwrSzQiqu2DBVTshkCXacvNsWGYJVVhhawA7d4R5WSWGFNbi8Aw6ZRc1brxMyWMzG3DSSSSoekkudhUd9yLb6qx39T9nMdj',
  },
];

interface KeyRowProps {
  policyKey: PolicyKey;
  account?: ApprovalAccount;
}

function KeyRow({ policyKey, account }: KeyRowProps) {
  return (
    <Flex alignItems="center" gap="space.03" py="space.01" minHeight="36px">
      <Flex width="32px" justifyContent="center" flexShrink={0}>
        {account ? (
          <AccountAvatar account={account} size="sm" />
        ) : (
          <Avatar size="sm" icon={<KeyIcon />} className={approvalIconTile} />
        )}
      </Flex>
      <Stack gap="0" flex="1" minWidth={0}>
        <styled.span textStyle="label.02">{policyKey.label}</styled.span>
        <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
          {policyKey.fingerprint} · {truncateMiddle(policyKey.xpub, 6)}
        </styled.span>
      </Stack>
    </Flex>
  );
}

interface PolicySectionProps {
  signer?: ApprovalAccount;
  keyHolder?: ApprovalAccount;
  divided?: boolean;
}

function PolicySection({ signer, keyHolder, divided }: PolicySectionProps) {
  const [firstKey, ...otherKeys] = policyKeys;
  return (
    <ApprovalSection
      label="Signing policy"
      divided={divided}
      trailing={<styled.span textStyle="label.03">{vaultThreshold} must sign</styled.span>}
    >
      {firstKey && <KeyRow policyKey={firstKey} account={signer ?? keyHolder} />}
      {otherKeys.map(policyKey => (
        <KeyRow key={policyKey.fingerprint} policyKey={policyKey} />
      ))}
      {signer && (
        <ApprovalCheck
          title={`${signer.name} is a signer on this vault`}
          caption="Its Bitcoin key is key 1"
        />
      )}
    </ApprovalSection>
  );
}

interface VaultAddressSectionProps {
  divided?: boolean;
  showSiteName?: boolean;
}

function VaultAddressSection({ divided, showSiteName }: VaultAddressSectionProps) {
  return (
    <ApprovalSection divided={divided}>
      {showSiteName && <ApprovalRow label="Name" value={vaultName} caption="Set by the site" />}
      <ApprovalRow
        stacked
        label="Vault address"
        value={<AddressDisplayer address={btcVaultAddress} />}
        caption="Derived by Leather from the policy keys"
      />
    </ApprovalSection>
  );
}

function DescriptorSection() {
  return (
    <ApprovalSection divided>
      <ApprovalDisclosureRow label="Descriptor" caption="wsh(sortedmulti(2, …)) · raw policy" />
    </ApprovalSection>
  );
}

const vaultKind = 'Bitcoin multisig account · works on Mainnet only';

const stxVaultAddress = 'SM2Z7N4VJ1Q4F6Y2HX9QZD6N8W0KXB3T5R7M4J9P';

interface StacksPolicyKey {
  label: string;
  publicKey: string;
}

const stacksPolicyKeys: StacksPolicyKey[] = [
  {
    label: 'Key 1',
    publicKey: '03a1f4c2d9e87b3605ac4e21fb9d07c3e58a6f12d0b94e7c35a8f60d21ce4b9f3a',
  },
  {
    label: 'Key 2',
    publicKey: '02c7e05b93fa18d46e2b7c09a4f1d35e86b20c7a9f4e13d58b6a02f7c91e4d8b25',
  },
  {
    label: 'Key 3',
    publicKey: '0259b3e8d12c07fa46b91e3d58c2a7f04e6d93b15a8c2f70e4b19d6a3c85f2e017',
  },
];

interface StacksKeyRowProps {
  policyKey: StacksPolicyKey;
  position: number;
  account?: ApprovalAccount;
}

function StacksKeyRow({ policyKey, position, account }: StacksKeyRowProps) {
  return (
    <Flex alignItems="center" gap="space.03" py="space.01" minHeight="36px">
      <Flex width="32px" justifyContent="center" flexShrink={0}>
        {account ? (
          <AccountAvatar account={account} size="sm" />
        ) : (
          <Avatar size="sm" icon={<KeyIcon />} className={approvalIconTile} />
        )}
      </Flex>
      <Stack gap="0" flex="1" minWidth={0}>
        <styled.span textStyle="label.02">
          {position}. {account ? `${account.name}’s Stacks key` : policyKey.label}
        </styled.span>
        <styled.span textStyle="caption.01" color="ink.text-subdued" truncate>
          {truncateMiddle(policyKey.publicKey, 8)}
        </styled.span>
      </Stack>
    </Flex>
  );
}

export const accountScenarios: Scenario[] = [
  {
    id: 'account-add-vault',
    family: 'account',
    label: 'Add a multisig account from Leather',
    method: 'btc_addAccount · add mode (app.leather.io)',
    refs: ['#2631'],
    events: [viewed('btc_addAccount', 'account', 'none'), decided('approve', '10_to_30s')],
    note: 'Leather reads the policy back to you before anything is stored: the threshold, one row per key with yours marked, the vault address it derived, and a positive check that this account holds one of the keys. The network is named because the account only exists there. The raw descriptor moves one tap away instead of filling the screen.',
    render() {
      return (
        <ApprovalShell footer={<ApprovalFooter primaryLabel="Add account" />}>
          <ApprovalHeader requester={leatherApp} account={btcSigner} network={mainnet} />
          <ApprovalIntent title={`Add ${vaultName} to Leather`} kind={vaultKind} />
          <PolicySection signer={btcSigner} />
          <VaultAddressSection divided />
          <DescriptorSection />
        </ApprovalShell>
      );
    },
  },
  {
    id: 'account-verify-vault',
    family: 'account',
    label: 'Verify a multisig address for another site',
    method: 'btc_addAccount · verify mode (any other origin)',
    refs: ['#2631'],
    note: 'Same read-out, different verb, with the address first because comparing it is the job here. Only Leather’s own web app can add accounts, so any other site gets a verify screen that says so in one quiet line, and the vault name stays out of the title and sits in a row marked as set by the site. Today this reads as a warning, then a toast says the account was added, which is not what happened.',
    render() {
      return (
        <ApprovalShell footer={<ApprovalFooter primaryLabel="Verify" />}>
          <ApprovalHeader requester={zest} account={btcSigner} network={mainnet} />
          <ApprovalIntent title="Verify a multisig address" kind={vaultKind} />
          <ApprovalNote>
            This site can only ask you to verify the address, not add it. Verifying tells the site
            that you hold one of the keys.
          </ApprovalNote>
          <VaultAddressSection showSiteName />
          <PolicySection signer={btcSigner} divided />
          <DescriptorSection />
        </ApprovalShell>
      );
    },
  },
  {
    id: 'account-not-signer',
    family: 'account',
    label: 'Connected account is not a signer',
    method: 'btc_addAccount · blocked',
    refs: ['#2631'],
    events: [
      viewed('btc_addAccount', 'account', 'blocking'),
      cautionShown('vault_policy', 'blocking'),
      decided('cancel', '3_to_10s'),
    ],
    note: 'A blocking state, not a warning: none of the keys belong to the connected account, so the callout names the account that does hold one, which is new, since today Leather checks only the active account. The policy stays visible with that account marked on key 1, so the mismatch can be checked, and Cancel remains. The account is not switched here: in this proposal add-account follows the connected account, like every request after connect, while today it uses the wallet’s active account and offers a switcher.',
    render() {
      return (
        <ApprovalShell
          footer={
            <ApprovalFooter
              primaryLabel="Add account"
              blockedReason={`${outsiderAccount.name} can’t add this vault.`}
            />
          }
        >
          <ApprovalHeader requester={leatherApp} account={outsiderAccount} network={mainnet} />
          <ApprovalIntent title={`Add ${vaultName} to Leather`} kind={vaultKind} />
          <ApprovalCaution
            tone="blocking"
            title={`${outsiderAccount.name} holds none of the keys`}
            source="Leather, from the policy keys"
          >
            {`${btcSigner.name} holds key 1. Connect app.leather.io with ${btcSigner.name} to add this vault.`}
          </ApprovalCaution>
          <PolicySection keyHolder={btcSigner} />
          <VaultAddressSection divided />
          <DescriptorSection />
        </ApprovalShell>
      );
    },
  },
  {
    id: 'account-stx-add-vault',
    family: 'account',
    label: 'Add a Stacks multisig account',
    method: 'stx_addAccount · add mode (app.leather.io)',
    refs: ['#2631', '#2587'],
    events: [viewed('stx_addAccount', 'account', 'none'), decided('approve', '10_to_30s')],
    note: 'The Stacks version of Add a multisig account: Leather reads the keys back in the order they were sent, marks yours, states the threshold, and shows the SM address it worked out from them, with a check that your Stacks key is one of them. On Stacks the order of the keys is part of the address, so the same three keys in another order make a different vault; the screen numbers them and says so, and every member has to add them in the same order. The request carries only public keys, a threshold and a name, so the name sits in a row marked as set by the site. Like the Bitcoin case, only Leather’s own web app can add; any other site gets a verify screen. Open question: whether Leather should also accept the keys sorted, the way Bitcoin’s sortedmulti does, so order stops mattering.',
    render() {
      const [firstKey, ...otherKeys] = stacksPolicyKeys;
      return (
        <ApprovalShell footer={<ApprovalFooter primaryLabel="Add account" />}>
          <ApprovalHeader requester={leatherApp} account={account1} network={mainnet} />
          <ApprovalIntent
            title={`Add ${vaultName} to Leather`}
            kind="Stacks multisig account · works on Mainnet only"
          />
          <ApprovalSection
            label="Keys, in this order"
            trailing={<styled.span textStyle="label.03">{vaultThreshold} must sign</styled.span>}
          >
            {firstKey && <StacksKeyRow policyKey={firstKey} position={1} account={account1} />}
            {otherKeys.map((policyKey, index) => (
              <StacksKeyRow key={policyKey.publicKey} policyKey={policyKey} position={index + 2} />
            ))}
            <ApprovalCheck
              title={`${account1.name} is a signer on this vault`}
              caption="Its Stacks key is key 1"
            />
          </ApprovalSection>
          <ApprovalSection divided>
            <ApprovalRow label="Name" value={vaultName} caption="Set by the site" />
            <ApprovalRow
              stacked
              label="Vault address"
              value={<AddressDisplayer address={stxVaultAddress} />}
              caption="Derived by Leather from the keys, in this order"
            />
          </ApprovalSection>
          <ApprovalNote>
            Key order is part of the address. The same keys in another order make a different vault,
            so every member adds them in this order.
          </ApprovalNote>
        </ApprovalShell>
      );
    },
  },
];
