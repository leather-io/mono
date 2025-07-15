import { t } from '@lingui/macro';

import { ArrowRefreshIcon, Box, NoteEmptyIcon, SparkleIcon } from '@leather.io/ui/native';

import { ToolbarButton } from './toolbar-button';

interface SearchBarToolbarProps {
  onExplore(): void;
  onConnections(): void;
  onRecents(): void;
}

export function SearchBarToolbar({ onExplore, onConnections, onRecents }: SearchBarToolbarProps) {
  return (
    <Box flexDirection="row" justifyContent="space-between">
      <ToolbarButton
        icon={<SparkleIcon variant="small" />}
        onPress={onExplore}
        label={t({
          id: 'browser.toolbox.explore',
          message: 'Explore',
        })}
      />
      <ToolbarButton
        icon={<ArrowRefreshIcon variant="small" />}
        onPress={onConnections}
        label={t({
          id: 'browser.toolbox.connections',
          message: 'Connections',
        })}
      />
      <ToolbarButton
        icon={<NoteEmptyIcon variant="small" />}
        onPress={onRecents}
        label={t({
          id: 'browser.toolbox.recents',
          message: 'Recents',
        })}
      />
    </Box>
  );
}
