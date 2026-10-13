import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { Flex } from 'leather-styles/jsx';

import { CloseIcon, IconButton } from '@leather.io/ui';

interface FeatureIntroducerHeaderProps {
  onClose?(): void;
}
export function FeatureIntroducerHeader({ onClose }: FeatureIntroducerHeaderProps) {
  if (!onClose) return null;

  return (
    <Flex position="absolute" top="0" right="0" zIndex={1} p="space.04">
      <IconButton
        data-testid={SharedComponentsSelectors.FeatureIntroducerCloseBtn}
        icon={<CloseIcon />}
        onClick={onClose}
      />
    </Flex>
  );
}
