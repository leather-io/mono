import { createCallable } from 'react-call';

import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { css } from 'leather-styles/css';
import { Stack, styled } from 'leather-styles/jsx';

import { Button, Sheet } from '@leather.io/ui';

import { analytics } from '@shared/utils/analytics';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { ButtonRow } from '@app/components/layout';

interface TaprootUtxoWarningResponse {
  userAcceptedRisk: boolean;
}

export const TaprootUtxoWarningDialog = createCallable<void, TaprootUtxoWarningResponse>(
  ({ call }) => {
    useOnMount(() => analytics.track('taproot_utxo_warning_dialog_displayed'));
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
          data-testid={SendCryptoAssetSelectors.TaprootUtxoWarningDialog}
        >
          <styled.h3 textStyle="heading.05">This transaction includes taproot UTXOs</styled.h3>

          <styled.p textStyle="body.02" color="ink.text-subdued">
            This transaction spends from taproot UTXOs. These UTXOs may contain ordinal
            inscriptions, rune, or BRC-20 tokens.
          </styled.p>
          <styled.p textStyle="body.02" color="ink.text-subdued">
            If you want to protect these assets, cancel this transaction and transfer them to
            another wallet.
          </styled.p>
          <styled.p textStyle="body.02" color="ink.text-subdued">
            Reach out to our support (
            <a
              className={css({ textDecorationLine: 'underline' })}
              href="mailto:support@leather.io?subject=Runes%20or%20inscription%20check%20and%2For%20migration"
            >
              support@leather.io
            </a>
            ) if you need help migrating your assets or understanding what this means.
          </styled.p>
        </Stack>
      </Sheet>
    );
  }
);
