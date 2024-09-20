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
  const { children, fullWidth, size, trigger, invert, type = 'button', variant, ...rest } = props;
  return (
    <StyledButton
      ref={ref}
      className={buttonRecipe({ fullWidth, size, invert, trigger, variant })}
      type={type}
      {...rest}
    >
      {children}
    </StyledButton>
  );
});
