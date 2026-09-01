import { styled } from 'leather-styles/jsx';

import { Caption, ItemLayout } from '@leather.io/ui';
import { truncateMiddle } from '@leather.io/utils';

import { AccountNameLayout } from '@app/components/account/account-name';
import { CurrentAccountAvatar } from '@app/features/current-account/current-account-avatar';
import { CurrentAccountName } from '@app/features/current-account/current-account-name';
import { type PolicyStore, parsePolicyParent } from '@app/store/policy/policy-store.utils';
import { usePolicyDisplayName } from '@app/store/policy/policy.selectors';
import { AccountAvatarItem } from '@app/ui/components/account/account-avatar/account-avatar-item';

import { PsbtRequestDetailsSectionLayout } from './psbt-request-details-section.layout';

interface PsbtBondAccountsProps {
  policy: PolicyStore;
  signerAddress: string;
}
export function PsbtBondAccounts({ policy, signerAddress }: PsbtBondAccountsProps) {
  const policyName = usePolicyDisplayName(policy);
  const policyParent = parsePolicyParent(policy.parentAccountId);

  return (
    <>
      <PsbtRequestDetailsSectionLayout>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Transacting with account
        </styled.span>
        <ItemLayout
          img={<AccountAvatarItem index={policyParent.accountIndex} publicKey={policy.address} />}
          titleLeft={<AccountNameLayout>{policyName}</AccountNameLayout>}
          captionLeft={<Caption>{truncateMiddle(policy.address, 4)}</Caption>}
        />
      </PsbtRequestDetailsSectionLayout>
      <PsbtRequestDetailsSectionLayout>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          Signing with account
        </styled.span>
        <ItemLayout
          img={<CurrentAccountAvatar />}
          titleLeft={<CurrentAccountName />}
          captionLeft={<Caption>{truncateMiddle(signerAddress, 4)}</Caption>}
        />
      </PsbtRequestDetailsSectionLayout>
    </>
  );
}
