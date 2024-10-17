import { TouchableOpacity } from 'react-native';

import { QuestionCircleIcon } from '@leather.io/ui/native';

interface MoreInfoIconProps {
  onPress(): void;
}
export function MoreInfoIcon({ onPress }: MoreInfoIconProps) {
  return (
    <TouchableOpacity onPress={onPress}>
      <QuestionCircleIcon variant="small" />
    </TouchableOpacity>
  );
}
