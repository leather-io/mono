import { Box, type BoxProps } from '../../box/box.native';
import { useRegisterApproverChild } from '../approver-context.shared';

export function ApproverSection(props: BoxProps) {
  useRegisterApproverChild('section');
  return <Box px="5" py="3" backgroundColor="ink.background-primary" {...props} />;
}
