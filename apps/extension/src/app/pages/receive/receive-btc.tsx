import { analytics } from '@shared/utils/analytics';

import { useWalletType } from '@app/common/use-wallet-type';
import { copyToClipboard } from '@app/common/utils/copy-to-clipboard';
import { useVerifyAddressNavigate } from '@app/features/ledger/flows/verify-address/use-verify-address-navigate';
import type { VerifyAddressVariant } from '@app/features/ledger/flows/verify-address/verify-address-paths';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentAccountId } from '@app/store/accounts/account';
import { useZeroIndexTaprootAddress } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useNativeSegwitAccountIndexAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useHasLedgerBitcoinKeys } from '@app/store/ledger/ledger.selectors';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { ReceiveTokensLayout } from './components/receive-tokens.layout';

interface ReceiveBtcModalProps {
  type?: 'btc' | 'btc-taproot';
  onClose(): void;
}

export function ReceiveBtcModal({ type = 'btc', onClose }: ReceiveBtcModalProps) {
  const toast = useToast();

  const currentAccount = useCurrentAccountId();
  const policy = useCurrentPolicy();
  const nativeSegwitAddress = useNativeSegwitAccountIndexAddressIndexZero(currentAccount);
  const taprootAddress = useZeroIndexTaprootAddress(currentAccount);
  const { walletType } = useWalletType();
  const hasLedgerBitcoinKeys = useHasLedgerBitcoinKeys();
  const verifyAddressNavigate = useVerifyAddressNavigate();

  const singleSigBtcAddress = type === 'btc-taproot' ? taprootAddress : nativeSegwitAddress;
  const singleSigAddress = policy ? undefined : singleSigBtcAddress;
  const address = policy?.chain === 'bitcoin' ? policy.address : singleSigAddress;
  const title = type === 'btc-taproot' ? 'BTC TAPROOT' : 'BTC';

  const canVerifyOnLedger = walletType === 'ledger' && hasLedgerBitcoinKeys;

  function getVerifyVariant(): VerifyAddressVariant {
    if (policy?.chain === 'bitcoin') return 'btcMultisig';
    if (type === 'btc-taproot') return 'btcTaproot';
    return 'btcNativeSegwit';
  }

  if (!address) return null;

  return (
    <ReceiveTokensLayout
      address={address}
      onClose={onClose}
      onCopyAddressToClipboard={async () => {
        analytics.track('copy_btc_address_to_clipboard', { type });
        await copyToClipboard(address);
        toast.success('Copied to clipboard!');
      }}
      onVerifyAddress={
        canVerifyOnLedger ? () => verifyAddressNavigate(getVerifyVariant()) : undefined
      }
      title={title}
    />
  );
}
