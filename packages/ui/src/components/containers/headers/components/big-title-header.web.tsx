import { ReactNode } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

import { CloseIcon } from '../../../../icons/index';
import { SharedComponentsSelectors } from '../../../../tmp/tests/selectors/shared-component.selectors';
import { HeaderActionButton } from './header-action-button.web';

interface BigTitleHeaderProps {
  onClose?(): void;
  title?: ReactNode;
}

export function BigTitleHeader({ onClose, title }: BigTitleHeaderProps) {
  return (
    <Flex justifyContent="space-between" mt={{ base: 'space.05', md: 'unset' }}>
      <styled.h3 textStyle="heading.03">{title}</styled.h3>
      {onClose && (
        <styled.div hideBelow="md">
          <HeaderActionButton
            icon={<CloseIcon />}
            dataTestId={SharedComponentsSelectors.HeaderCloseBtn}
            onAction={onClose}
          />
        </styled.div>
      )}
    </Flex>
  );
}
