import { t } from '@lingui/core/macro';

import { Box, ClockIcon, ConnectionIcon, GridIcon } from '@leather.io/ui/native';

import { ToolbarButton } from './toolbar-button';

interface SearchBarToolbarProps {
  onExplore(): void;
  onConnections(): void;
  onRecents(): void;
}

export function SearchBarToolbar({ onExplore, onConnections, onRecents }: SearchBarToolbarProps) {
  return (
    <Box flexDirection="row" justifyContent="space-between">
      <ToolbarButton icon={<GridIcon variant="small" />} onPress={onExplore} label={t`Explore`} />
      <ToolbarButton
        icon={<ConnectionIcon variant="small" />}
        onPress={onConnections}
        label={t`Connections`}
      />
      <ToolbarButton icon={<ClockIcon variant="small" />} onPress={onRecents} label={t`Recents`} />
    </Box>
  );
}
