import { useCallback } from 'react';

import { bytesToHex } from '@noble/hashes/utils';
import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { Form, Formik, FormikProps } from 'formik';
import { Box, Flex } from 'leather-styles/jsx';
import * as yup from 'yup';

import { BitcoinError } from '@leather.io/bitcoin';
import type { InscriptionAsset } from '@leather.io/models';
import type { UtxoWithDerivationPath } from '@leather.io/query';
import { Button, OrdinalAvatarIcon, Spinner } from '@leather.io/ui';
import { isError } from '@leather.io/utils';

import { FormErrorMessages } from '@shared/error-messages';
import { logger } from '@shared/logger';
import type { OrdinalSendFormValues } from '@shared/models/form.model';
import { analytics } from '@shared/utils/analytics';

import { ErrorLabel } from '@app/components/error-label';
import { TextInputFieldError } from '@app/components/field-error';
import { InscriptionPreview } from '@app/components/inscription-preview-card/components/inscription-preview';
import { InscriptionPreviewCard } from '@app/components/inscription-preview-card/inscription-preview-card';
import { CollectibleAsset } from '@app/pages/send/ordinal-inscription/components/collectible-asset';
import { useGenerateUnsignedOrdinalTx } from '@app/pages/send/ordinal-inscription/hooks/use-generate-ordinal-tx';
import { RecipientAddressTypeField } from '@app/pages/send/send-crypto-asset-form/components/recipient-address-type-field';
import { useBitcoinBroadcastTransaction } from '@app/query/bitcoin/transaction/use-bitcoin-broadcast-transaction';
import { useSignBitcoinTx } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';

import { SendInscriptionSheetLayout } from './send-inscription-sheet.layout';

const recipientFieldName = 'recipient';

interface SendInscriptionFormProps {
  inscription: InscriptionAsset;
  utxo: UtxoWithDerivationPath;
  feeRate: number;
  validationSchema: yup.ObjectSchema<{ recipient: string | undefined }>;
  currentError: string | null;
  isSubmitting: boolean;
  onClose(): void;
  onSuccess(txid: string): void;
  onError(error: string): void;
  refetchUtxos(): Promise<unknown>;
  getNumberOfInscriptionOnUtxo(txid: string, vout: number): number;
}

export function SendInscriptionForm({
  inscription,
  utxo,
  feeRate,
  validationSchema,
  currentError,
  isSubmitting,
  onClose,
  onSuccess,
  onError,
  refetchUtxos,
  getNumberOfInscriptionOnUtxo,
}: SendInscriptionFormProps) {
  const { coverFeeFromAdditionalUtxos } = useGenerateUnsignedOrdinalTx(utxo);
  const sign = useSignBitcoinTx();
  const { broadcastTx } = useBitcoinBroadcastTransaction();

  const handleSubmit = useCallback(
    async (values: OrdinalSendFormValues) => {
      try {
        if (Number(inscription.offset) !== 0) {
          throw new Error(FormErrorMessages.NonZeroOffsetInscription);
        }

        const numInscriptionsOnUtxo = getNumberOfInscriptionOnUtxo(utxo.txid, utxo.vout);
        if (numInscriptionsOnUtxo > 1) {
          throw new Error(FormErrorMessages.UtxoWithMultipleInscriptions);
        }

        const resp = coverFeeFromAdditionalUtxos(values);
        if (!resp) {
          throw new Error(FormErrorMessages.InsufficientFundsToCoverFee);
        }

        const signedTx = await sign(resp.psbt, resp.signingConfig);
        if (!signedTx) {
          throw new Error('Failed to sign transaction');
        }

        signedTx.finalize();
        logger.debug('Signed inscription PSBT', signedTx.hex);

        await broadcastTx({
          skipSpendableCheckUtxoIds: [inscription.txid],
          tx: bytesToHex(signedTx.extract()),
          async onSuccess(resultTxid: string) {
            analytics.track('broadcast_ordinal_transaction');
            await refetchUtxos();
            onSuccess(resultTxid);
          },
          onError(e) {
            analytics.track('broadcast_ordinal_error', { error: e });
            onError(e instanceof Error ? e.message : 'Broadcast failed');
          },
        });
      } catch (error) {
        if (error instanceof BitcoinError && error.message === 'InsufficientFunds') {
          onError(FormErrorMessages.InsufficientFundsToCoverFee);
        } else if (isError(error)) {
          onError(error.message);
        } else {
          onError('An unexpected error occurred');
        }
      }
    },
    [
      inscription,
      utxo,
      getNumberOfInscriptionOnUtxo,
      coverFeeFromAdditionalUtxos,
      sign,
      broadcastTx,
      refetchUtxos,
      onSuccess,
      onError,
    ]
  );

  return (
    <Formik
      validationSchema={validationSchema}
      initialValues={{
        [recipientFieldName]: '',
        inscription,
        feeRate,
      }}
      onSubmit={handleSubmit}
    >
      {(props: FormikProps<OrdinalSendFormValues>) => (
        <Form>
          <SendInscriptionSheetLayout
            title="Send"
            isShowing
            onClose={onClose}
            footer={
              <Button
                data-testid={SendCryptoAssetSelectors.PreviewSendTxBtn}
                onClick={() => props.handleSubmit()}
                type="submit"
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner size="sm" /> : 'Send'}
              </Button>
            }
          >
            <Box display="flex" flexDirection="column" px="space.06" pb="space.04">
              <InscriptionPreviewCard
                image={<InscriptionPreview inscription={inscription} />}
                subtitle="Ordinal inscription"
                title={inscription.title}
              />
              <Box mt={['space.04', 'space.06', '100px']}>
                <Flex flexDirection="column" mt="space.05" width="100%">
                  <CollectibleAsset icon={<OrdinalAvatarIcon />} name="Ordinal inscription" />
                  <RecipientAddressTypeField
                    name={recipientFieldName}
                    label="To"
                    placeholder="Enter recipient address"
                  />
                  <TextInputFieldError name={recipientFieldName} />
                </Flex>
              </Box>
              {currentError && (
                <ErrorLabel data-testid={SendCryptoAssetSelectors.FormFieldInputErrorLabel}>
                  {currentError}
                </ErrorLabel>
              )}
            </Box>
          </SendInscriptionSheetLayout>
        </Form>
      )}
    </Formik>
  );
}
