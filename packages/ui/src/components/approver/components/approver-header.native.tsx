import { Box } from '../../box/box.native';
import { Favicon } from '../../favicon/favicon.native';
import { Text } from '../../text/text.native';
import { useApproverContext, useRegisterApproverChild } from '../approver-context.shared';

interface ApproverHeaderProps {
  showLargeFavicon?: boolean;
  title: string;
}

export function ApproverHeader({ title, showLargeFavicon }: ApproverHeaderProps) {
  useRegisterApproverChild('header');
  const { requester } = useApproverContext();

  return (
    <Box px="5" pt="6" pb="5" backgroundColor="ink.background-primary" style={{ marginBottom: -1 }}>
      {requester && showLargeFavicon && <LargeFavicon origin={requester} />}
      <Box gap="2">
        <Text variant="heading03">{title}</Text>
        <RequesterInfo />
      </Box>
    </Box>
  );
}

interface LargeFaviconProps {
  origin: string;
}

function LargeFavicon({ origin }: LargeFaviconProps) {
  return (
    <Box
      bg="ink.background-primary"
      borderRadius="lg"
      width={72}
      height={72}
      alignItems="center"
      justifyContent="center"
      borderWidth={1}
      borderColor="ink.border-transparent"
      mb="5"
    >
      <Favicon origin={origin} size={32} />
    </Box>
  );
}

function RequesterInfo() {
  const { requester, hostname } = useApproverContext();

  if (!requester) return null;

  return (
    <Box flexDirection="row" gap="1" mb="-2">
      <Favicon origin={requester} />
      <Text variant="label03">
        <Text variant="label03" fontWeight="400">
          Requested by
        </Text>{' '}
        {hostname}
      </Text>
    </Box>
  );
}
