import DeveloperConsole from '@/assets/developer-console.svg';
import OptionsIcon from '@/assets/options.svg';

import { Box, TouchableOpacity } from '@leather.io/ui/native';

export function OptionsHeader({ onPress }: { onPress?(): void }) {
  return (
    <Box flexDirection="row">
      <TouchableOpacity p="3">
        <OptionsIcon width={24} height={24} />
      </TouchableOpacity>
      <TouchableOpacity p="3" onPress={onPress}>
        <DeveloperConsole width={24} height={24} />
      </TouchableOpacity>
    </Box>
  );
}
