import { type ReactNode, useId } from 'react';

import { Box, styled } from 'leather-styles/jsx';

import { ListContainer, Pressable } from '@leather.io/ui';

interface AccountCardContentProps {
  icon: ReactNode;
  title: string;
  description: string;
}

interface PressableAccountCardProps extends AccountCardContentProps {
  onClick(): void;
  action?: never;
  help?: never;
}

interface AccountCardWithActionProps extends AccountCardContentProps {
  onClick?: never;
  action: ReactNode;
  help?: ReactNode;
}

type AccountActionCardProps = PressableAccountCardProps | AccountCardWithActionProps;

export function AccountActionCard({
  icon,
  title,
  description,
  help,
  action,
  onClick,
}: AccountActionCardProps) {
  const descriptionId = useId();
  const heading = (
    <styled.span display="block" textStyle="label.02" color="ink.text-primary">
      {title}
    </styled.span>
  );
  const caption = (
    <styled.span
      id={descriptionId}
      display="block"
      textStyle="caption.01"
      color="ink.text-secondary"
    >
      {description}
      {help}
    </styled.span>
  );

  if (onClick) {
    return (
      <ListContainer p="space.00">
        <Pressable
          type="button"
          onClick={onClick}
          aria-label={title}
          aria-describedby={descriptionId}
          alignItems="center"
          gap="space.03"
          p="space.04"
          borderRadius="md"
          textAlign="left"
          _before={{ inset: 0, borderRadius: 'md' }}
        >
          {icon}
          <Box minWidth={0}>
            {heading}
            {caption}
          </Box>
        </Pressable>
      </ListContainer>
    );
  }

  return (
    <ListContainer
      display="grid"
      gridTemplateAreas={{
        base: '"icon title action" "description description description"',
        md: '"icon title action" "icon description action"',
      }}
      gridTemplateColumns="auto minmax(0, 1fr) auto"
      alignItems="center"
      columnGap={{ base: 'space.02', md: 'space.03' }}
      rowGap={{ base: 'space.02', md: 'space.00' }}
      p="space.04"
    >
      <Box gridArea="icon">{icon}</Box>
      <Box gridArea="title" minWidth={0}>
        {heading}
      </Box>
      <Box gridArea="description">{caption}</Box>
      <Box gridArea="action">{action}</Box>
    </ListContainer>
  );
}
