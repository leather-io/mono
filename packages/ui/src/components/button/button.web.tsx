import { forwardRef } from 'react';

import { styled } from 'leather-styles/jsx';
import { type ButtonVariantProps, button as buttonRecipe } from 'leather-styles/recipes';

const StyledButton = styled('button');

export type ButtonProps = Omit<
  React.ComponentProps<typeof StyledButton>,
  keyof ButtonVariantProps
> &
  ButtonVariantProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {
    children,
    fullWidth,
    size,
    trigger,
    invert,
    type = 'button',
    variant,
    disabled: disabledProp,
    ...rest
  } = props;
  const isLoading = rest['aria-busy'] === true || rest['aria-busy'] === 'true';
  const disabled = isLoading || disabledProp;

  return (
    <StyledButton
      ref={ref}
      className={buttonRecipe({ fullWidth, size, invert, trigger, variant })}
      type={type}
      disabled={disabled}
      {...rest}
    >
      <styled.span opacity={isLoading ? 0 : 1}>{children}</styled.span>
    </StyledButton>
  );
});

Button.displayName = 'Button';
