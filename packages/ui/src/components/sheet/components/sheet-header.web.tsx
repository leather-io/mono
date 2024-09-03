import { ReactNode } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

import { CloseIcon } from '../../../icons/index.web';
import { IconButton } from '../../icon-button/icon-button.web';

interface SheetHeaderProps {
  onClose?(): void;
  title?: ReactNode;
  variant?: 'default' | 'large'; // large variant is BigTitle in designs
}

export function SheetHeader({ onClose, title, variant = 'default' }: SheetHeaderProps) {
  return (
    <Flex
      justifyContent="flex-end"
      alignItems="center"
      m={{ base: 0, md: 'auto' }}
      p={variant === 'large' ? 'space.05' : 'space.04'}
      bg="transparent"
      width="100%"
      minHeight="headerHeight"
    >
      {title && (
        <styled.h2
          flex="1"
          textAlign={variant === 'large' ? 'left' : 'center'}
          textStyle={variant === 'large' ? 'heading.03' : 'heading.05'}
        >
          {title}
        </styled.h2>
      )}
      {onClose && (
        <IconButton icon={<CloseIcon />} onClick={onClose} position="absolute" top="space.05" />
      )}
    </Flex>
  );
}
