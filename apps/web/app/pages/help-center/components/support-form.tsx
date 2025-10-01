import { Form } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { Button, InfoCircleIcon } from '@leather.io/ui';
import { delay } from '@leather.io/utils';

import { useSupportForm } from './support-form-schema';

export function SupportForm() {
  const form = useSupportForm();

  async function onSuccess() {
    await delay(400);
    form.reset();
    alert('Thank you for your message. We will get back to you soon!');
  }

  return (
    <Box width="100%" maxW="600px">
      <Box mb="space.07" bg="ink.background-secondary" p="space.04" borderRadius="md">
        <Box display="flex" justifyContent="space-between" mb="space.02" pr="space.03">
          <styled.h4 textStyle="label.02">Stay safe from scams</styled.h4>
          <InfoCircleIcon color="ink.text-subdued" variant="medium" />
        </Box>
        <styled.p textStyle="caption.01" color="ink.action-primary-hover">
          Leather will never contact you first via direct messages on any platform. If someone
          reaches out claiming to be from Leather and offering help, they're a scammer.
          <br />
          <br />
          Never share your Secret Key or personal information—not even with Leather staff. We will
          never ask for it to resolve any issue. Keep it private and secure at all times.
        </styled.p>
      </Box>
      <Box border="default" borderRadius="md" pt="space.01">
        <Form name="fa-form-1" method="post" encType="multipart/form-data" onSubmit={onSuccess}>
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
