import { Box } from 'native';
import { HasChildren } from 'src/utils/has-children.shared';

export function ApproverActions({ children }: HasChildren) {
  return (
    <Box flexDirection="row" justifyContent="space-between" gap="4">
      {children}
    </Box>
  );
}
