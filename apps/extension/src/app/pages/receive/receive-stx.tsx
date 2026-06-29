import { analytics } from '@shared/utils/analytics';

import { useCurrentAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentPolicy, usePolicyDisplayName } from '@app/store/policy/policy.selectors';

import { ReceiveTokensLayout } from './components/receive-tokens.layout';

interface ReceiveStxModalProps {
  onClose(): void;
}

export function ReceiveStxModal({ onClose }: ReceiveStxModalProps) {
  const toast = useToast();
  const currentAccount = useCurrentStacksAccount();
  const policy = useCurrentPolicy();

  const { data: accountName = 'Account' } = useCurrentAccountDisplayName();
  const policyName = usePolicyDisplayName(policy);

  const singleSigAddress = policy ? undefined : currentAccount?.address;
  const address = policy?.chain === 'stacks' ? policy.address : singleSigAddress;
  if (!address) return null;

  return (
    <ReceiveTokensLayout
      address={address}
      accountName={policyName ?? accountName}
      onClose={onClose}
      onCopyAddressToClipboard={async () => {
        analytics.track('copy_stx_address_to_clipboard');
        await copyToClipboard(address);
        toast.success('Copied to clipboard!');
      }}
      title="STX"
    />
  );
}
