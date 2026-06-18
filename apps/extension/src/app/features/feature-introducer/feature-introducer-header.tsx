import { SharedComponentsSelectors } from '@tests/selectors/shared-component.selectors';
import { Flex } from 'leather-styles/jsx';

import { CloseIcon, IconButton } from '@leather.io/ui';

interface FeatureIntroducerHeaderProps {
  onClose?(): void;
}
export function FeatureIntroducerHeader({ onClose }: FeatureIntroducerHeaderProps) {
  return (
    <Flex
      bg="ink.background-secondary"
      height="64px"
      width="100%"
      alignItems="center"
      justifyContent="flex-end"
      px="space.04"
    >
      {onClose && (
        <IconButton
          data-testid={SharedComponentsSelectors.FeatureIntroducerCloseBtn}
          icon={<CloseIcon />}
          onClick={onClose}
        />
      )}
    </Flex>
  );
}
