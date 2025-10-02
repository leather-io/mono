import { Form } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { Button } from '@leather.io/ui';
import { delay } from '@leather.io/utils';

import { useSupportForm } from './support-form-schema';

interface SupportFormProps {
  onSuccess?: () => void;
}

export function SupportForm({ onSuccess }: SupportFormProps) {
  const form = useSupportForm();

  async function handleSuccess() {
    await delay(400);
    form.reset();
    onSuccess?.();
  }

  return (
    <Box width="100%" maxW="600px">
      <Box border="default" borderRadius="md" pt="space.01">
        <Form name="fa-form-1" method="post" encType="multipart/form-data" onSubmit={handleSuccess}>
          <Flex flexDirection="column">
            <styled.input
              placeholder="Name"
              id="name"
              type="text"
              {...form.register('name')}
              width="100%"
              p="space.03"
              fontSize="14px"
              bg="ink.background-primary"
              outline="none"
            />
            {form.formState.errors.name && (
              <ErrorText message={form.formState.errors.name.message} />
            )}

            <styled.input
              placeholder="Email"
              id="email"
              type="email"
              {...form.register('email')}
              width="100%"
              p="space.03"
              borderTop="default"
              fontSize="14px"
              outline="none"
              bg="ink.background-primary"
            />
            {form.formState.errors.email && (
              <ErrorText message={form.formState.errors.email.message} />
            )}

            <styled.input
              placeholder="Subject"
              id="subject"
              type="text"
              {...form.register('subject')}
              width="100%"
              outline="none"
              p="space.03"
              borderTop="default"
              fontSize="14px"
              bg="ink.background-primary"
            />
            {form.formState.errors.subject && (
              <ErrorText message={form.formState.errors.subject.message} />
            )}

            <styled.textarea
              placeholder="Message (Required)"
              id="body"
              {...form.register('body')}
              width="100%"
              p="space.03"
              fontSize="14px"
              outline="none"
              borderTop="default"
              bg="ink.background-primary"
              minHeight="150px"
              resize="none"
            />
            {form.formState.errors.body && (
              <ErrorText message={form.formState.errors.body.message} />
            )}
          </Flex>
          <Button
            type="submit"
            borderRadius="unset"
            disabled={
              form.formState.isSubmitting || (form.formState.isSubmitted && !form.formState.isValid)
            }
            fullWidth
          >
            {form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
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
