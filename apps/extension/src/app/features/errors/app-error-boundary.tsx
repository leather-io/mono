import BroadcastError from '@assets/images/unhappy-face-ui.png';
import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { Box, Center, Flex, HStack, styled } from 'leather-styles/jsx';

import { Button, CopyIcon, Link } from '@leather.io/ui';
import { isError } from '@leather.io/utils';

import { Prism } from '@app/common/clarity-prism';
import { useClipboard } from '@app/common/hooks/use-copy-to-clipboard';
import { isPopupMode } from '@app/common/utils';
import { compliantErrorBody } from '@app/query/common/compliance-checker/compliance-checker.query';
import { CodeBlock } from '@app/ui/components/codeblock';

import { useToast } from '../toasts/use-toast';

function shouldShowContactSupportMessage(errorMsg: string) {
  if (errorMsg.includes(compliantErrorBody)) return false;
  return true;
}

function ErroBoundaryBody() {
  return (
    <styled.span
      data-testid={SharedComponentsSelectors.BroadcastErrorTitle}
      mx="space.05"
      mt="space.05"
      textStyle="label.02"
    >
      Leather has crashed. If this problem persists, contact our{' '}
      <Link href="https://app.leather.io/support" target="_blank" textDecoration="underline">
        <styled.span
          data-testid={SharedComponentsSelectors.BroadcastErrorTitle}
          textStyle="label.02"
        >
          support team.
        </styled.span>
      </Link>
    </styled.span>
  );
}

const title = 'Something went wrong';

const defaultErrorText = 'Unknown error';

function getErrorText(error: unknown) {
  if (!isError(error)) return defaultErrorText;
  return error.stack || defaultErrorText;
}

function ErrorIcon() {
  return (
    <Box mt="space.06">
      <img src={BroadcastError} alt="Unhappy user interface cloud" width="106px" />
    </Box>
  );
}

function ErrorTitle() {
  return (
    <styled.span
      data-testid={SharedComponentsSelectors.BroadcastErrorTitle}
      mx="space.05"
      mt="space.05"
      textStyle="heading.05"
      textAlign="center"
    >
      {title}
    </styled.span>
  );
}

interface ErrorCodeBlockProps {
  errorText: string;
}

function ErrorCodeBlock({ errorText }: ErrorCodeBlockProps) {
  if (!errorText) return null;

  return (
    <CodeBlock
      bg="ink.background-secondary"
      borderRadius="sm"
      my="space.05"
      mx="space.05"
      p="space.04"
      prism={Prism}
      code={errorText}
      language="json"
      hideLineHover
    />
  );
}

interface ActionButtonsProps {
  onClickCopy(): void;
}

function ActionButtons({ onClickCopy }: ActionButtonsProps) {
  return (
    <HStack width="100%" gap="space.04">
      <Button flex="1" onClick={onClickCopy} variant="outline">
        <Center gap="5">
          Copy error
          <CopyIcon />
        </Center>
      </Button>
      <Button flex="1" onClick={() => window.location.reload()}>
        Reload extension
      </Button>
    </HStack>
  );
}

interface ContentWrapperProps {
  errorText: string;
}

function ContentWrapper({ errorText }: ContentWrapperProps) {
  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      width="100%"
      maxWidth="500px"
    >
      <ErrorIcon />
      <ErrorTitle />
      {shouldShowContactSupportMessage(errorText) && <ErroBoundaryBody />}
      <ErrorCodeBlock errorText={errorText} />
    </Flex>
  );
}

interface RouterErrorBoundaryProps {
  error?: unknown;
}

export function RouterErrorBoundary({ error }: RouterErrorBoundaryProps) {
  const toast = useToast();

  const errorText = getErrorText(error);

  const { onCopy } = useClipboard(getErrorText(error));

  function onClickCopy() {
    onCopy();
    toast.success('Error copied!');
  }

  const isPopup = isPopupMode();

  // Popup mode: sticky buttons at bottom
  if (isPopup) {
    return (
      <Flex
        minHeight="100vh"
        width="100%"
        flexDirection="column"
        position="relative"
        overflow="hidden"
      >
        {/* Scrollable content area */}
        <Flex
          flex="1"
          overflowY="auto"
          px="space.05"
          pt="space.06"
          pb="120px"
          flexDirection="column"
          alignItems="center"
        >
          <ContentWrapper errorText={errorText} />
        </Flex>

        {/* Sticky buttons at bottom */}
        <Flex
          position="sticky"
          bottom="0"
          width="100%"
          bg="ink.background-primary"
          borderTop="default"
          borderColor="ink.border-transparent"
          p="space.05"
          zIndex="999"
        >
          <Box width="100%" maxWidth="500px" mx="auto">
            <ActionButtons onClickCopy={onClickCopy} />
          </Box>
        </Flex>
      </Flex>
    );
  }

  // Full page mode: original centered layout
  return (
    <Center minHeight="100vh" width="100%" px="space.05" py="space.06">
      <Flex
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        width="100%"
        maxWidth="500px"
      >
        <ContentWrapper errorText={errorText} />
        <ActionButtons onClickCopy={onClickCopy} />
      </Flex>
    </Center>
  );
}
