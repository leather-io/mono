import { Box, QuestionCircleIcon, Text, TouchableOpacity } from '../../../../native';

const SHEET_HEADER_HEIGHT = 64;

interface SheetHeaderProps {
  title: string;
  onPressSupport?: () => void;
}

export function SheetHeader({ title, onPressSupport }: SheetHeaderProps) {
  return (
    <Box alignItems="center" flexDirection="row" height={SHEET_HEADER_HEIGHT}>
      <Box alignItems="flex-start" flex={2}>
        <Box alignItems="center" flexDirection="row" gap="3">
          <Text color="ink.text-primary" variant="heading05">
            {title}
          </Text>
        </Box>
      </Box>
      {onPressSupport && (
        <Box alignItems="flex-end" flex={1}>
          <TouchableOpacity onPress={onPressSupport} zIndex="10">
            <QuestionCircleIcon variant="small" />
          </TouchableOpacity>
        </Box>
      )}
    </Box>
  );
}
