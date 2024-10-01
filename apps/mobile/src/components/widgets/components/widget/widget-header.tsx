import { Money } from '@leather.io/models';
import { Box, SheetRef, TouchableOpacity } from '@leather.io/ui/native';

import { WidgetTitle } from './widget-title';

interface WidgetHeaderProps {
  title: string;
  sheetRef?: React.RefObject<SheetRef>;
  sheet?: React.ReactNode;
  totalBalance?: Money;
}

export function WidgetHeader({ title, totalBalance, sheetRef, sheet }: WidgetHeaderProps) {
  if (sheet && sheetRef) {
    return (
      <>
        <TouchableOpacity
          onPress={() => sheetRef.current?.present()}
          flexDirection="row"
          gap="1"
          alignItems="center"
        >
          <WidgetTitle title={title} totalBalance={totalBalance} />
        </TouchableOpacity>

        {sheet}
      </>
    );
  }
  return (
    <Box flexDirection="row" gap="1" alignItems="center" marginHorizontal="5">
      <WidgetTitle title={title} totalBalance={totalBalance} />
    </Box>
  );
}
