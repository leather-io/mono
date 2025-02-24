import { Box } from '../../box/box.native';
import { Text } from '../../text/text.native';
import { useRegisterApproverChild } from '../approver-context.shared';

export function ApproverHeader({ title }: { title: string }) {
  useRegisterApproverChild('header');
  return (
    <Box px="5" py="5" backgroundColor="ink.background-primary">
      <Text variant="heading03">{title}</Text>
    </Box>
  );
}
