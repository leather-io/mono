import { Box, QuestionCircleIcon, Text, TouchableOpacity } from '../../../../native';

const SHEET_HEADER_HEIGHT = 72;

interface SheetHeaderProps {
  title: string;
  icon: React.ReactNode;
  onPressSupport?: () => unknown;
}

export function SheetHeader({ title, icon, onPressSupport }: SheetHeaderProps) {
  return (
    <Box alignItems="center" flexDirection="row" height={SHEET_HEADER_HEIGHT}>
      <Box alignItems="flex-start" flex={2}>
        <Box alignItems="center" flexDirection="row" gap="3">
          {icon}
          <Text color="ink.text-primary" variant="heading05">
            {title}
          </Text>
        </Box>
      </Box>
      <Box alignItems="flex-end" flex={1}>
        <TouchableOpacity onPress={onPressSupport} zIndex="10">
          <QuestionCircleIcon variant="small" />
        </TouchableOpacity>
      </Box>
    </Box>
  );
}
