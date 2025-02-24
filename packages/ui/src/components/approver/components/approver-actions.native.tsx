import { HasChildren } from 'src/utils/has-children.shared';

import { Box } from '../../box/box.native';

export function ApproverActions({ children }: HasChildren) {
  return (
    <Box flexDirection="row" justifyContent="space-between" gap="4">
      {children}
    </Box>
  );
}
