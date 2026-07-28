import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Box } from 'leather-styles/jsx';

import { Sheet, SheetHeader, Tabs } from '@leather.io/ui';

import type { ReceiveView } from '@app/common/receive/receive';
import { useWalletType } from '@app/common/use-wallet-type';
import { useVerifyAddressNavigate } from '@app/features/ledger/flows/verify-address/use-verify-address-navigate';
import { useZeroIndexTaprootAddress } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentAccountNativeSegwitAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import {
  useHasLedgerBitcoinKeys,
  useHasLedgerStacksKeys,
} from '@app/store/ledger/ledger.selectors';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { ReceiveCollectibles } from './components/receive-collectibles';
import { ReceiveTokens } from './components/receive-tokens';
import { ReceiveBtcModal } from './receive-btc';
import { ReceiveStxModal } from './receive-stx';

export const receiveTabStyle = {
  mt: 'space.03',
  paddingX: 'space.05',
  pb: 'space.05',
  minHeight: '260px',
};

interface ReceiveDialogProps {
  view: ReceiveView;
  onChangeView(view: ReceiveView): void;
  onClose(): void;
}

export function ReceiveDialog({ view, onChangeView, onClose }: ReceiveDialogProps) {
  if (view === 'btc') return <ReceiveBtcModal type="btc" onClose={onClose} />;
  if (view === 'btc-taproot') return <ReceiveBtcModal type="btc-taproot" onClose={onClose} />;
  if (view === 'stx') return <ReceiveStxModal onClose={onClose} />;
  return <ReceiveSheet type={view} onChangeView={onChangeView} onClose={onClose} />;
}

interface ReceiveSheetProps {
  type?: 'full' | 'collectible';
  onChangeView(view: ReceiveView): void;
  onClose(): void;
}

function ReceiveSheet({ type = 'full', onChangeView, onClose }: ReceiveSheetProps) {
  const btcAddressNativeSegwit = useCurrentAccountNativeSegwitAddressIndexZero();
  const btcAddressTaproot = useZeroIndexTaprootAddress();
  const stxAddress = useCurrentStacksAccountAddress();
  const { walletType } = useWalletType();
  const hasLedgerBitcoinKeys = useHasLedgerBitcoinKeys();
  const hasLedgerStacksKeys = useHasLedgerStacksKeys();
  const policy = useCurrentPolicy();
  const verifyAddressNavigate = useVerifyAddressNavigate();

  const canVerifyOnLedger = walletType === 'ledger' && !policy;
  const canVerifyBtc = canVerifyOnLedger && hasLedgerBitcoinKeys;
  const canVerifyStx = canVerifyOnLedger && hasLedgerStacksKeys;

  const title =
    type === 'full' ? (
      <>
        Choose asset <br /> to receive
      </>
    ) : (
      <>
        Receive <br /> collectible
      </>
    );

  function Collectibles() {
    return (
      <ReceiveCollectibles stxAddress={stxAddress} onClickQrStacksNft={() => onChangeView('stx')} />
    );
  }

  return (
    <Sheet
      header={<SheetHeader variant="large" title={title} onClose={onClose} />}
      onClose={onClose}
      isShowing
    >
      {type === 'collectible' && <Collectibles />}
      {type === 'full' && (
        <Tabs.Root defaultValue="tokens">
          <Tabs.List>
            <Tabs.Trigger value="tokens" data-testid={HomePageSelectors.ReceiveAssetsTab}>
              Tokens
            </Tabs.Trigger>
            <Tabs.Trigger
              value="collectibles"
              data-testid={HomePageSelectors.ReceiveCollectiblesTab}
            >
              Collectibles
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="tokens">
            {/* FIXME 96px should be sizes.footerHeight */}
            <Box mb={{ base: '96px', md: 'unset' }}>
              <ReceiveTokens
                btcAddressNativeSegwit={btcAddressNativeSegwit}
                btcAddressTaproot={btcAddressTaproot}
                stxAddress={stxAddress}
                onClickQrBtc={() => onChangeView('btc')}
                onClickQrBtcTaproot={() => onChangeView('btc-taproot')}
                onClickQrStx={() => onChangeView('stx')}
                onClickVerifyBtc={
                  canVerifyBtc ? () => verifyAddressNavigate('btcNativeSegwit') : undefined
                }
                onClickVerifyBtcTaproot={
                  canVerifyBtc ? () => verifyAddressNavigate('btcTaproot') : undefined
                }
                onClickVerifyStx={canVerifyStx ? () => verifyAddressNavigate('stx') : undefined}
              />
            </Box>
          </Tabs.Content>
          <Tabs.Content value="collectibles">
            <Collectibles />
          </Tabs.Content>
        </Tabs.Root>
      )}
    </Sheet>
  );
}
