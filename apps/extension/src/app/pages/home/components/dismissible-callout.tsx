import { Box } from 'leather-styles/jsx';

import { Callout, type CalloutProps, CloseIcon, IconButton } from '@leather.io/ui';

import { useDismissMessage } from '@app/store/settings/settings.actions';
import { useDismissedMessageIds } from '@app/store/settings/settings.selectors';

interface DismissibleCalloutProps extends CalloutProps {
  messageId: string;
}

export function DismissibleCallout({ messageId, children, ...props }: DismissibleCalloutProps) {
  const dismissMessage = useDismissMessage();
  const dismissedIds = useDismissedMessageIds();

  if (dismissedIds.includes(messageId)) return null;

  return (
    <Box position="relative">
      <Callout icon={null} pr="space.04" {...props}>
        {children}
      </Callout>
      <IconButton
        aria-label="Dismiss"
        position="absolute"
        top="space.01"
        right="space.01"
        icon={<CloseIcon variant="small" />}
        onClick={() => dismissMessage(messageId)}
      />
    </Box>
  );
}
