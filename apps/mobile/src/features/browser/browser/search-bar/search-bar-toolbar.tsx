import { t } from '@lingui/macro';

import {
  ArrowOutOfBoxIcon,
  ArrowRefreshIcon,
  Box,
  NoteEmptyIcon,
  SparkleIcon,
} from '@leather.io/ui/native';

import { ToolbarButton } from './toolbar-button';

interface SearchBarToolbarProps {
  onClickApps(): void;
  onRefresh(): void;
  onPaste(): void;
  onShare(): void;
}

export function SearchBarToolbar({
  onClickApps,
  onRefresh,
  onPaste,
  onShare,
}: SearchBarToolbarProps) {
  return (
    <Box flexDirection="row" justifyContent="space-between" px="5" my="5">
      <ToolbarButton
        icon={<SparkleIcon />}
        onPress={onClickApps}
        label={t({
          id: 'browser.toolbox.apps',
          message: 'Apps',
        })}
      />
      <ToolbarButton
        icon={<ArrowRefreshIcon />}
        onPress={onRefresh}
        label={t({
          id: 'browser.toolbox.refresh',
          message: 'Refresh',
        })}
      />
      <ToolbarButton
        icon={<NoteEmptyIcon />}
        onPress={onPaste}
        label={t({
          id: 'browser.toolbox.paste',
          message: 'Paste',
        })}
      />
      <ToolbarButton
        icon={<ArrowOutOfBoxIcon />}
        onPress={onShare}
        label={t({
          id: 'browser.toolbox.share',
          message: 'Share',
        })}
      />
    </Box>
  );
}
