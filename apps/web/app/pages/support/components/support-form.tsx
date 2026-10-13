import { useEffect } from 'react';
import { Form, useActionData, useNavigation } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';
import { delay } from '@leather.io/utils';

import { useSupportForm } from './support-form-schema';

interface SupportFormProps {
  onSuccess?(): void;
  onError?(): void;
}

export function SupportForm({ onSuccess, onError }: SupportFormProps) {
  const { formState, register, reset } = useSupportForm();
  const actionData = useActionData<{ success: boolean; error?: string; status?: number }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  useEffect(() => {
    if (!actionData) return;

    if (actionData.success) {
      void delay(400).then(() => {
        reset();
        onSuccess?.();
      });
    } else {
      onError?.();
    }
  }, [actionData, reset, onSuccess, onError]);

  return (
    <Box width="100%" maxW="600px">
      <Box border="default" borderRadius="md" pt="space.01">
        <Form name="fa-form-1" method="post" encType="multipart/form-data">
          <Flex flexDirection="column">
            <styled.input
              placeholder="Name"
              id="name"
              type="text"
              {...register('name')}
              width="100%"
              p="space.03"
              fontSize="14px"
              bg="ink.background-primary"
              outline="none"
            />
            {formState.errors.name && <ErrorText message={formState.errors.name.message} />}

            <styled.input
              placeholder="Email"
              id="email"
              type="email"
              {...register('email')}
              width="100%"
              p="space.03"
              borderTop="default"
              fontSize="14px"
              outline="none"
              bg="ink.background-primary"
            />
            {formState.errors.email && <ErrorText message={formState.errors.email.message} />}

            <styled.input
              placeholder="Subject"
              id="subject"
              type="text"
              {...register('subject')}
              width="100%"
              outline="none"
              p="space.03"
              borderTop="default"
              fontSize="14px"
              bg="ink.background-primary"
            />
            {formState.errors.subject && <ErrorText message={formState.errors.subject.message} />}

            <styled.textarea
              placeholder="Message (Required)"
              id="body"
              {...register('body')}
              width="100%"
              p="space.03"
              fontSize="14px"
              outline="none"
              borderTop="default"
              bg="ink.background-primary"
              minHeight="150px"
              resize="none"
            />
            {formState.errors.body && <ErrorText message={formState.errors.body.message} />}
          </Flex>
          <Button
            type="submit"
            borderRadius="unset"
            disabled={isSubmitting || !formState.isValid}
            fullWidth
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </Form>
      </Box>
    </Box>
  );
}

function ErrorText({ message }: { message: string | undefined }) {
  return (
    <styled.label
      ml="space.03"
      mb="space.01"
      textStyle="caption.01"
      color="red.action-primary-default"
    >
      {message}
    </styled.label>
  );
}
