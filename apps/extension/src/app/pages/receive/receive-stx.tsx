import { analytics } from '@shared/utils/analytics';

import { useCurrentAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { ReceiveTokensLayout } from './components/receive-tokens.layout';

interface ReceiveStxModalProps {
  onClose(): void;
}

export function ReceiveStxModal({ onClose }: ReceiveStxModalProps) {
  const toast = useToast();
  const currentAccount = useCurrentStacksAccount();

  const { data: accountName = 'Account' } = useCurrentAccountDisplayName();

  if (!currentAccount) return null;

  return (
    <ReceiveTokensLayout
      address={currentAccount.address}
      accountName={accountName}
      onClose={onClose}
      onCopyAddressToClipboard={async () => {
        analytics.track('copy_stx_address_to_clipboard');
        await copyToClipboard(currentAccount.address);
        toast.success('Copied to clipboard!');
      }}
      title="STX"
    />
  );
}
