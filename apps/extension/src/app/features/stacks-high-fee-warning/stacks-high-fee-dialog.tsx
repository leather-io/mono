import { SendCryptoAssetSelectors } from '@tests/selectors/send.selectors';
import { useFormikContext } from 'formik';

import { ErrorTriangleIcon, Link } from '@leather.io/ui';

import { type StacksSendFormValues } from '@shared/models/form.model';

import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { WarningSheet } from '@app/components/warning-sheet/warning-sheet';

import { useStacksHighFeeWarningContext } from './stacks-high-fee-warning-container';

interface HighFeeSheetProps {
  learnMoreUrl: string;
}
export function HighFeeSheet({ learnMoreUrl }: HighFeeSheetProps) {
  const { handleSubmit, values } = useFormikContext<StacksSendFormValues>();
  const { showHighFeeWarningSheet, setHasBypassedFeeWarning, setShowHighFeeWarningSheet } =
    useStacksHighFeeWarningContext();

  return (
    <WarningSheet
      data-testid={SendCryptoAssetSelectors.HighFeeWarningSheet}
      isShowing={showHighFeeWarningSheet}
      onClose={() => setShowHighFeeWarningSheet(false)}
      icon={<ErrorTriangleIcon />}
      title={`Pay ${values.fee}\u00A0${values.feeCurrency} in fees?`}
      body={
        <>
          This fee is higher than usual. It can't be undone and won't be returned, even if the
          transaction fails.{' '}
          <Link onClick={() => openInNewTab(learnMoreUrl)} whiteSpace="nowrap">
            Learn more
          </Link>
        </>
      }
      primaryAction={{
        label: "Yes, I'm sure",
        testId: SendCryptoAssetSelectors.HighFeeWarningSheetSubmit,
        onClick() {
          setHasBypassedFeeWarning(true);
          handleSubmit();
        },
      }}
      secondaryAction={{
        label: 'Edit fee',
        onClick: () => setShowHighFeeWarningSheet(false),
      }}
    />
  );
}
