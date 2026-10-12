import { t } from '@lingui/core/macro';

import { Box, Button } from '@leather.io/ui/native';

interface ManageTokensFooterProps {
  onPress(): void;
}
export function ManageTokensFooter({ onPress }: ManageTokensFooterProps) {
  return (
    <Box alignItems="center" py="3">
      <Button variant="ghost" size="sm" onPress={onPress}>
        {t`Manage tokens`}
      </Button>
    </Box>
  );
}
