import { type ReactNode } from 'react';

import { Flex, styled } from 'leather-styles/jsx';

import { CloseIcon } from '../../icons/close-icon.web';
import { IconButton } from '../icon-button/icon-button.web';

interface SheetHeaderProps {
  onClose?(): void;
  title?: ReactNode;
  showCloseButton?: boolean;
  variant?: 'default' | 'large' | 'task'; // large variant is BigTitle in designs
}

export function SheetHeader({
  onClose,
  title,
  variant = 'default',
  showCloseButton = true,
}: SheetHeaderProps) {
  const isTask = variant === 'task';

  return (
    <Flex
      justifyContent="flex-end"
      alignItems="center"
      position="relative"
      m={{ base: 0, md: 'auto' }}
      py={variant === 'large' ? 'space.05' : 'space.04'}
      px={variant === 'default' ? 'space.04' : 'space.05'}
      gap={isTask ? 'space.04' : undefined}
      bg="transparent"
      width="100%"
      minHeight="headerHeight"
    >
      {title && (
        <styled.h2
          flex="1"
          color={isTask ? 'ink.text-primary' : undefined}
          textAlign={variant === 'default' ? 'center' : 'left'}
          textStyle={variant === 'large' ? 'heading.03' : 'heading.05'}
        >
          {title}
        </styled.h2>
      )}
      {showCloseButton && onClose && (
        <IconButton
          icon={<CloseIcon />}
          onClick={onClose}
          aria-label="Close"
          flexShrink={0}
          position={isTask ? 'static' : 'absolute'}
          top="50%"
          right={variant === 'large' ? 'space.05' : 'space.04'}
          transform={isTask ? undefined : 'translateY(-50%)'}
          height="headerContainerHeight"
        />
      )}
    </Flex>
  );
}
