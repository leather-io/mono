import { Box } from '../../box/box.native';
import { Favicon } from '../../favicon/favicon.native';
import { Text } from '../../text/text.native';
import { useApproverContext, useRegisterApproverChild } from '../approver-context.shared';

interface ApproverHeaderProps {
  title: string;
}

export function ApproverHeader({ title }: ApproverHeaderProps) {
  useRegisterApproverChild('header');
  const { requester, hostname } = useApproverContext();

  return (
    <Box px="5" pt="6" pb="5" backgroundColor="ink.background-primary" style={{ marginBottom: -1 }}>
      <Box gap="2">
        <Text variant="heading03">{title}</Text>
        {requester && (
          <Box flexDirection="row" gap="1">
            <Favicon origin={requester} />
            <Text variant="label03">Requested by {hostname}</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
