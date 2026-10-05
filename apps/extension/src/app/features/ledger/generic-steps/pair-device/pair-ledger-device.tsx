import { Stack, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';
import { closeWindow } from '@shared/utils';

import { openIndexPageInNewTab } from '@app/common/utils/open-in-new-tab';
import { UnsupportedBrowserImg } from '@app/features/ledger/illustrations/ledger-illu-unsupported-browser';

import { LedgerTitle } from '../../components/ledger-title';
import { LedgerWrapper } from '../../components/ledger-wrapper';
import { useLedgerNavigate } from '../../hooks/use-ledger-navigate';

export function PairLedgerDevice() {
  const ledgerNavigate = useLedgerNavigate();

  async function openPairingTab() {
    await openIndexPageInNewTab(`/${RouteUrls.LedgerPairDeviceTab}`);
    closeWindow();
  }

  return (
    <LedgerWrapper image={<UnsupportedBrowserImg />}>
      <LedgerTitle>Connect your Ledger in full screen</LedgerTitle>
      <styled.span textStyle="body.02" color="ink.text-subdued" mt="space.03" mb="space.05">
        Leather can't reach your Ledger from this window. Open Leather in full screen to connect it,
        then start this request again.
      </styled.span>
      <Stack width="100%" gap="space.03">
        <Button onClick={openPairingTab}>Open Leather in full screen</Button>
        <Button variant="outline" onClick={() => ledgerNavigate.toConnectStepAndTryAgain()}>
          Try again
        </Button>
      </Stack>
    </LedgerWrapper>
  );
}
