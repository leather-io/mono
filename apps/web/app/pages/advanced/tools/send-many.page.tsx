import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';

import { zodResolver } from '@hookform/resolvers/zod';
import { Flex, styled } from 'leather-styles/jsx';
import { WhenClient } from '~/components/when-client';
import { SendManyForm } from '~/features/tools/send-many/components/send-many-form';
import { type SendManyToken, sendManyTokens } from '~/features/tools/send-many/send-many-constants';
import {
  type SendManyFormValues,
  sendManyDefaults,
  sendManyFormSchema,
} from '~/features/tools/send-many/send-many-schema';
import { useSendManyAction } from '~/features/tools/send-many/send-many-transaction';
import { Page } from '~/layouts/page/page';
import { useStacksAccount } from '~/store/addresses';

import { Button } from '@leather.io/ui';

function isValidToken(value: string): value is SendManyToken {
  return value in sendManyTokens;
}

export function SendManyPage() {
  return (
    <Page>
      <Page.Header title="Send Many" />
      <WhenClient>
        <SendManyPageContent />
      </WhenClient>
    </Page>
  );
}

function SendManyPageContent() {
  const { token: tokenParam } = useParams();
  const navigate = useNavigate();
  const stacksAccount = useStacksAccount();
  const { result, error, loading, submitSendMany } = useSendManyAction();

  const initialToken = tokenParam && isValidToken(tokenParam) ? tokenParam : 'stx';

  const form = useForm<SendManyFormValues>({
    resolver: zodResolver(sendManyFormSchema),
    defaultValues: { ...sendManyDefaults, token: initialToken },
  });

  const watchedToken = form.watch('token');

  useEffect(() => {
    void navigate(`/advanced/send-many/${watchedToken}`, { replace: true });
  }, [watchedToken, navigate]);

  function onSubmit(values: SendManyFormValues) {
    if (!stacksAccount?.address) return;
    void submitSendMany(values.token, values.recipients, stacksAccount.address);
  }

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SendManyForm />

        <Flex mt="space.05" gap="space.03" alignItems="center">
          <Button type="submit" disabled={loading || !stacksAccount?.address}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </Flex>

        {error && (
          <Flex mt="space.04">
            <styled.p textStyle="caption.01" color="red.action-primary-default">
              {error}
            </styled.p>
          </Flex>
        )}

        {result && (
          <Flex mt="space.04" flexDir="column" gap="space.02">
            <styled.p textStyle="label.01">Transaction submitted</styled.p>
            <styled.p textStyle="caption.01" wordBreak="break-all">
              {result.txid}
            </styled.p>
          </Flex>
        )}
      </form>
    </FormProvider>
  );
}
