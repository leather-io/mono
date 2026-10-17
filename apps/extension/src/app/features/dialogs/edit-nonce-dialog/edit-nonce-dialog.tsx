import { useCallback, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router';

import { Stack, styled } from 'leather-styles/jsx';

import { Link, Sheet, SheetHeader } from '@leather.io/ui';

import {
  type StacksSendFormValues,
  type StacksTransactionFormValues,
} from '@shared/models/form.model';

import { useOnMount } from '@app/common/hooks/use-on-mount';
import { openInNewTab } from '@app/common/utils/open-in-new-tab';

import { EditNonceForm } from './components/edit-nonce-form';

const url = 'https://leather.gitbook.io/guides/transactions/nonces';

export function EditNonceSheet() {
  const { clearErrors, getValues, setValue, trigger } = useFormContext<
    StacksSendFormValues | StacksTransactionFormValues
  >();
  const [loadedNextNonce, setLoadedNextNonce] = useState<number | string>();

  const navigate = useNavigate();
  const { search } = useLocation();

  useOnMount(() => setLoadedNextNonce(getValues('nonce')));

  const onGoBack = useCallback(() => {
    if (search) {
      return navigate('..' + search, { replace: true });
    }
    void navigate(-1);
  }, [navigate, search]);

  const onBlur = useCallback(() => trigger('nonce'), [trigger]);

  const onSubmit = useCallback(async () => {
    const isValid = await trigger('nonce');
    if (isValid) void onGoBack();
  }, [onGoBack, trigger]);

  const onClose = useCallback(() => {
    clearErrors('nonce');
    setValue('nonce', loadedNextNonce);
    void onGoBack();
  }, [clearErrors, loadedNextNonce, onGoBack, setValue]);

  return (
    <Sheet isShowing onClose={onClose} header={<SheetHeader title="Edit nonce" />}>
      <Stack gap="space.05" pb="space.06" px="space.05">
        <styled.span textStyle="caption.01">
          If your transaction has been pending for a long time, its nonce might not be correct.
          <Link fontSize="14px" ml="space.01" onClick={() => openInNewTab(url)}>
            Learn more.
          </Link>
        </styled.span>
        <EditNonceForm
          onBlur={() => void onBlur()}
          onClose={onClose}
          onSubmit={() => void onSubmit()}
        />
      </Stack>
    </Sheet>
  );
}
