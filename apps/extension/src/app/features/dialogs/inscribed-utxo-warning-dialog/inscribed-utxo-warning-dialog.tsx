import { createCallable } from 'react-call';

import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { Stack, styled } from 'leather-styles/jsx';

import { Button, Sheet } from '@leather.io/ui';

import { analytics } from '@shared/utils/analytics';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { ButtonRow } from '@app/components/layout';

interface InscribedUtxoWarningResponse {
  userAcceptedRisk: boolean;
}

export const InscribedUtxoWarningDialog = createCallable<void, InscribedUtxoWarningResponse>(
  ({ call }) => {
    useOnMount(() => analytics.untypedTrack('inscribed_utxo_warning_dialog_displayed'));
    return (
      <Sheet
        isShowing={!call.ended}
        onClose={() => call.end({ userAcceptedRisk: false })}
        footer={
          <ButtonRow flexDirection="row">
            <Button
              onClick={() => call.end({ userAcceptedRisk: false })}
              variant="outline"
              flexGrow={1}
            >
              Cancel
            </Button>
            <Button onClick={() => call.end({ userAcceptedRisk: true })} type="submit" flexGrow={1}>
              I understand, continue
            </Button>
          </ButtonRow>
        }
      >
        <Stack
          px="space.05"
          gap="space.05"
          py="space.06"
          data-testid={SendCryptoAssetSelectors.InscriptionWarningDialog}
        >
          <styled.h3 textStyle="heading.05">This transaction includes inscribed UTXOs</styled.h3>

          <styled.p textStyle="body.02" color="ink.text-subdued-secondary">
            This transaction includes UTXOs that contain inscriptions. If you want to collect
            inscriptions, you may not want to proceed.
          </styled.p>
          <styled.p textStyle="body.02" color="ink.text-subdued-secondary">
            If inscriptions aren’t important to you, you can proceed with the transaction.
          </styled.p>
        </Stack>
      </Sheet>
    );
  }
);
