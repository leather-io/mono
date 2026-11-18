import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { type IconProps } from '../../icons/icon/create-icon.web';
import { Button } from './button.web';

function StubIcon({ variant = 'medium', color = 'ink.action-primary-default' }: IconProps) {
  return <span data-testid="icon" data-variant={variant} data-color={color} />;
}

describe('Button icons', () => {
  it('keeps the default size of an icon passed as an element', () => {
    render(<Button iconStart={<StubIcon />}>Add wallet</Button>);
    expect(screen.getByTestId('icon').dataset.variant).toBe('medium');
  });

  it('keeps an explicit variant on an icon passed as an element', () => {
    render(<Button iconStart={<StubIcon variant="small" />}>Add wallet</Button>);
    expect(screen.getByTestId('icon').dataset.variant).toBe('small');
  });

  it('renders an icon passed as a component at the small size', () => {
    render(<Button iconStart={StubIcon}>Copy</Button>);
    expect(screen.getByTestId('icon').dataset.variant).toBe('small');
  });

  it('gives an element icon the button text color unless it sets its own', () => {
    render(
      <>
        <Button iconStart={<StubIcon />}>Inherit</Button>
        <Button iconEnd={<StubIcon color="ink.text-subdued" />}>Own</Button>
      </>
    );
    const [inherited, own] = screen.getAllByTestId('icon');
    expect(inherited.dataset.color).toBe('current');
    expect(own.dataset.color).toBe('ink.text-subdued');
  });
});
