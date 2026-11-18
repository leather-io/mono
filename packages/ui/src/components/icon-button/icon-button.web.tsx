import { type ReactElement } from 'react';

import { Stack, styled } from 'leather-styles/jsx';

import { Button, type ButtonProps } from '../button/button.web';
import AccessibleIcon from './accessible-icon.web';

export interface IconButtonProps extends ButtonProps {
  icon: ReactElement;
  label?: string;
}

function getElementDisplayName({ type }: ReactElement) {
  if (typeof type === 'string' || !('displayName' in type)) return undefined;
  return typeof type.displayName === 'string' ? type.displayName : undefined;
}

export function IconButton({ icon, label, disabled, ...rest }: IconButtonProps) {
  return (
    <Button
      key={label}
      color="ink.text-primary"
      px={label ? 'space.01' : '0'}
      py={label ? 'space.01' : '0'}
      height={label ? 'auto' : 'headerContainerHeight'}
      textStyle="label.02"
      variant="ghost"
      width={label ? 'iconButtonWithLabelWidth' : 'headerContainerHeight'}
      outline="none"
      opacity={disabled ? '0.5' : '1'}
      disabled={disabled}
      rounded="sm"
      {...rest}
    >
      <Stack alignItems="center" gap="space.01">
        <AccessibleIcon label={label || getElementDisplayName(icon) || 'Icon Button'}>
          {icon}
        </AccessibleIcon>
        {label && <styled.span>{label}</styled.span>}
      </Stack>
    </Button>
  );
}
