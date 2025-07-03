import { Box } from '../../box/box.native';
import { Text } from '../../text/text.native';
import { useRegisterApproverChild } from '../approver-context.shared';

export function ApproverHeader({ title }: { title: string }) {
  useRegisterApproverChild('header');

  return (
    <Box px="5" pt="6" pb="5" backgroundColor="ink.background-primary" style={{ marginBottom: -1 }}>
      <Text variant="heading03">{title}</Text>
    </Box>
  );
}
