import { HasChildren } from '@/utils/types';

import { Box } from '@leather.io/ui/native';

import { WidgetHeader } from './widget-header';
import { WidgetTitle } from './widget-title';

export function Widget({ children }: HasChildren) {
  return (
    <Box paddingVertical="5" flexDirection="column" gap="3">
      {children}
    </Box>
  );
}

Widget.Header = WidgetHeader;
Widget.Title = WidgetTitle;
Widget.Body = Box;
