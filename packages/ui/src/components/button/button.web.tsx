import { ComponentType, ReactElement, ReactNode, isValidElement } from 'react';

import { styled } from 'leather-styles/jsx';
import { isNullish } from 'remeda';

import { IconProps } from '../../icons/icon/create-icon.web';

const loadingStyles = {
  _loading: {
    _after: {
      animation: 'spin',
      border: '2px solid',
      borderColor: 'currentColor',
      borderBottomColor: 'transparent',
      boxSizing: 'border-box',
      content: '""',
      display: 'inline-block',
      height: '20px',
      left: 'calc(50% - 10px)',
      position: 'absolute',
      rounded: '50%',
      top: 'calc(50% - 10px)',
      width: '20px',
    },
  },
};

const StyledButton = styled('button', {
  base: {
    position: 'relative',
    textStyle: 'label.02',
    textAlign: 'center',
    borderRadius: 'round',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'space.02',
    whiteSpace: 'nowrap',
    ...loadingStyles,
  },
  variants: {
    size: {
      sm: {
        height: '32px',
        px: 'space.03',
      },
      md: {
        height: '36px',
        px: 'space.03',
      },
      lg: {
        height: '48px',
        px: 'space.04',
      },
    },
    variant: {
      solid: {
        bg: 'ink.action-primary-default',
        color: 'ink.background-primary',
        _hover: {
          bg: 'ink.action-primary-hover',
        },
        _active: {
          bg: 'ink.action-primary-default',
        },
        _focus: {
          _before: {
            border: '3px solid {colors.blue.border}',
          },
        },
        _disabled: {
          bg: 'ink.background-secondary',
          color: 'ink.text-non-interactive',
          cursor: 'not-allowed',
          _hover: { bg: 'ink.background-secondary' },
          _loading: { bg: 'ink.action-primary-default' },
        },
      },
      outline: {
        border: '1px solid {colors.ink.border-default}',
        color: 'ink.action-primary-default',
        _hover: {
          bg: 'ink.component-background-hover',
        },
        _active: {
          bg: 'ink.component-background-pressed',
        },
        _focus: {
          _before: {
            border: '3px solid {colors.blue.border}',
          },
        },
        _disabled: {
          _hover: { bg: 'unset' },
          border: '1px solid {colors.ink.text-non-interactive}',
          color: 'ink.text-non-interactive',
          cursor: 'not-allowed',
        },
      },
      ghost: {
        color: 'ink.action-primary-default',
        _active: {
          bg: 'ink.component-background-pressed',
        },
        _disabled: {
          _hover: { bg: 'unset' },
          color: 'ink.text-non-interactive',
          cursor: 'not-allowed',
        },
        _focus: {
          _before: {
            border: '3px solid {colors.blue.border}',
          },
        },
        _hover: {
          bg: 'ink.component-background-hover',
        },
        ...loadingStyles,
      },
    },
    intent: {
      default: {},
      danger: {},
      success: {},
    },
    fullWidth: { true: { width: '100%' } },
  },

  compoundVariants: [
    {
      variant: 'solid',
      intent: 'danger',
      css: {
        bg: 'red.action-primary-default',
        _hover: {
          bg: 'red.action-primary-default',
          opacity: 0.8,
        },
        _active: {
          opacity: 1,
          bg: 'red.action-primary-default',
        },
      },
    },
    {
      variant: 'outline',
      intent: 'danger',
      css: {
        bg: 'transparent',
        borderColor: 'red.border',
        color: 'red.action-primary-default',
        _hover: {
          bg: 'red.action-primary-default',
          borderColor: 'red.action-primary-default',
          color: 'white',
        },
        _active: {
          opacity: 1,
          bg: 'red.action-primary-default',
        },
      },
    },
    {
      variant: 'ghost',
      intent: 'danger',
      css: {
        bg: 'transparent',
        borderColor: 'transparent',
        color: 'red.action-primary-default',
        _hover: {
          bg: 'red.action-primary-default',
          borderColor: 'red.action-primary-default',
          color: 'white',
          opacity: 0.8,
        },
        _active: {
          opacity: 1,
          bg: 'red.action-primary-default',
        },
      },
    },
  ],

  defaultVariants: {
    size: 'lg',
    variant: 'solid',
  },
});

export interface ButtonProps extends React.ComponentProps<typeof StyledButton> {
  iconStart?: ComponentType<IconProps> | ReactElement;
  iconEnd?: ComponentType<IconProps> | ReactElement;
}

export function Button(props: ButtonProps) {
  const {
    iconStart,
    iconEnd,
    type = 'button',
    children,
    disabled: disabledProp,
    ref,
    ...rest
  } = props;
  const isLoading = rest['aria-busy'] === true || rest['aria-busy'] === 'true';
  const disabled = isLoading || disabledProp;

  return (
    <StyledButton ref={ref} type={type} disabled={disabled} flexShrink={0} {...rest}>
      {renderIcon(iconStart, { variant: 'small', color: 'current' })}
      <styled.span opacity={isLoading ? 0 : 1}>{children}</styled.span>
      {renderIcon(iconEnd, { variant: 'small', color: 'current' })}
    </StyledButton>
  );
}

Button.displayName = 'Button';

function renderIcon(icon: ComponentType<IconProps> | ReactNode, props: IconProps) {
  if (isValidElement(icon) || isNullish(icon)) {
    return icon;
  }
  const IconComponent = icon as ComponentType<IconProps>;
  return <IconComponent {...props} />;
}
