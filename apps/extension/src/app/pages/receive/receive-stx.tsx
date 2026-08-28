import { analytics } from '@shared/utils/analytics';

import { useCurrentAccountDisplayName } from '@app/common/hooks/account/use-account-names';
import { useWalletType } from '@app/common/use-wallet-type';
import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useVerifyAddressNavigate } from '@app/features/ledger/flows/verify-address/use-verify-address-navigate';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useHasLedgerStacksKeys } from '@app/store/ledger/ledger.selectors';
import { useCurrentPolicy, usePolicyDisplayName } from '@app/store/policy/policy.selectors';

import { ReceiveTokensLayout } from './components/receive-tokens.layout';

interface ReceiveStxModalProps {
  onClose(): void;
}

export function ReceiveStxModal({ onClose }: ReceiveStxModalProps) {
  const toast = useToast();
  const currentAccount = useCurrentStacksAccount();
  const policy = useCurrentPolicy();
  const { walletType } = useWalletType();
  const hasLedgerStacksKeys = useHasLedgerStacksKeys();
  const verifyAddressNavigate = useVerifyAddressNavigate();

  const { data: accountName = 'Account' } = useCurrentAccountDisplayName();
  const policyName = usePolicyDisplayName(policy);

  const singleSigAddress = policy ? undefined : currentAccount?.address;
  const address = policy?.chain === 'stacks' ? policy.address : singleSigAddress;

  const canVerifyOnLedger = walletType === 'ledger' && hasLedgerStacksKeys;
  const verifyVariant = policy?.chain === 'stacks' ? 'stxMultisig' : 'stx';

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
      onVerifyAddress={canVerifyOnLedger ? () => verifyAddressNavigate(verifyVariant) : undefined}
      title="STX"
    />
  );
}
