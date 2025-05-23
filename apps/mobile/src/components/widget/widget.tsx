import { Box, HasChildren } from '@leather.io/ui/native';

import { WidgetHeader } from './widget-header';
import { WidgetTitle } from './widget-title';

export function Widget({ children }: HasChildren) {
  return (
    <Box flexDirection="column" gap="3">
      {children}
    </Box>
  );
}

Widget.Header = WidgetHeader;
Widget.Title = WidgetTitle;
Widget.Body = Box;
