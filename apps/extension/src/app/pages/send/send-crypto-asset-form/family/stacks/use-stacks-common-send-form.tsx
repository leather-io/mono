import { type UseFormSetError } from 'react-hook-form';

import { FeeTypes, type Money } from '@leather.io/models';

import { FormErrorMessages } from '@shared/error-messages';
import { type StacksSendFormValues } from '@shared/models/form.model';

import { stxMemoValidator } from '@app/common/validation/forms/memo-validators';
import { stxRecipientValidator } from '@app/common/validation/forms/recipient-validators';
import { nonceValidator } from '@app/common/validation/nonce-validators';
import { stxFeeCurrency } from '@app/components/fees-row/fees-row';
import { useStacksHighFeeWarningContext } from '@app/features/stacks-high-fee-warning/stacks-high-fee-warning-container';
import { useNextNonce } from '@app/query/stacks/nonce/account-nonces.hooks';
import { useCurrentStacksAccountAddress } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';
import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { useSendFormRouteState } from '../../hooks/use-send-form-route-state';
import { createDefaultInitialFormValues } from '../../send-form.utils';

interface UseStacksCommonSendFormArgs {
  symbol: string;
  availableTokenBalance: Money;
}
export function useStacksCommonSendForm({
  symbol,
  availableTokenBalance,
}: UseStacksCommonSendFormArgs) {
  const routeState = useSendFormRouteState();
  const stxAddress = useCurrentStacksAccountAddress();
  const { data: nextNonce } = useNextNonce(stxAddress);
  const currentNetwork = useCurrentNetworkState();
  const policy = useCurrentPolicy();
  const isStacksPolicy = policy?.chain === 'stacks';
  const { shouldWarnAboutHighFee, setShowHighFeeWarningSheet } = useStacksHighFeeWarningContext();

  const initialValues: StacksSendFormValues = createDefaultInitialFormValues({
    hasDismissedHighFeeWarning: false,
    isShowingHighFeeDiaglog: false,
    fee: '',
    feeCurrency: stxFeeCurrency,
    feeType: FeeTypes[FeeTypes.Unknown],
    memo: '',
    nonce: isStacksPolicy ? 0 : nextNonce?.nonce,
    recipientBnsName: '',
    symbol,
    ...routeState,
  });

  function checkFormValidation(
    values: StacksSendFormValues,
    setError: UseFormSetError<StacksSendFormValues>
  ) {
    if (!values.recipient) {
      setError('recipient', { message: FormErrorMessages.AddressRequired });
      setError('recipientBnsName', { message: FormErrorMessages.AddressRequired });
      return false;
    }

    const isStxFee = values.feeCurrency === stxFeeCurrency;
    if (isStxFee && shouldWarnAboutHighFee(values.fee)) {
      setShowHighFeeWarningSheet(true);
      return false;
    }
    return true;
  }

  return {
    initialValues,
    availableTokenBalance,
    checkFormValidation,
    recipient: stxRecipientValidator(
      policy?.chain === 'stacks' ? policy.address : stxAddress,
      currentNetwork
    ),
    memo: stxMemoValidator(FormErrorMessages.MemoExceedsLimit),
    nonce: nonceValidator,
  };
}
