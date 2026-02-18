import { useCallback, useState } from 'react';

import { useFormikContext } from 'formik';
import { Stack, styled } from 'leather-styles/jsx';

import { Link, Sheet, SheetHeader } from '@leather.io/ui';

import { StacksSendFormValues, StacksTransactionFormValues } from '@shared/models/form.model';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';
import { useNavigate } from '@app/routes/compat';

import { EditNonceForm } from './components/edit-nonce-form';

const url = 'https://leather.gitbook.io/guides/transactions/nonces';

export function EditNonceSheet() {
  const { errors, setFieldError, setFieldValue, validateField, values } = useFormikContext<
    StacksSendFormValues | StacksTransactionFormValues
  >();
  const [loadedNextNonce, setLoadedNextNonce] = useState<number | string>();

  const navigate = useNavigate();
  useOnMount(() => setLoadedNextNonce(values.nonce));

  const onGoBack = useCallback(() => {
    void navigate(-1);
  }, [navigate]);

  const onBlur = useCallback(() => validateField('nonce'), [validateField]);

  const onSubmit = useCallback(async () => {
    await validateField('nonce');
    if (!errors.nonce) void onGoBack();
  }, [errors.nonce, onGoBack, validateField]);

  const onClose = useCallback(async () => {
    if (!values.nonce) await setFieldValue('nonce', undefined);
    setFieldError('nonce', '');
    await setFieldValue('nonce', loadedNextNonce);
    void onGoBack();
  }, [loadedNextNonce, onGoBack, setFieldError, setFieldValue, values.nonce]);

  return (
    <Sheet isShowing onClose={onClose} header={<SheetHeader title="Edit nonce" />}>
      <Stack gap="space.05" pb="space.06" px="space.05">
        <styled.span textStyle="caption.01">
          If your transaction has been pending for a long time, its nonce might not be correct.
          <Link fontSize="14px" ml="space.01" onClick={() => openInNewTab(url)}>
            Learn more.
          </Link>
        </styled.span>
        <EditNonceForm onBlur={onBlur} onClose={onClose} onSubmit={onSubmit} />
      </Stack>
    </Sheet>
  );
}
