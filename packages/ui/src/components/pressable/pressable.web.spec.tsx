import { fireEvent, render, screen } from '@testing-library/react';
import { css } from 'leather-styles/css';
import { describe, expect, it, vi } from 'vitest';

import { Pressable, pressableBaseStyles, pressableStyles } from './pressable.web';

const disabledSelector = '&:is(:disabled, [data-disabled])';

describe('pressable web styles', () => {
  it('keeps the disabled visual styling in the always-applied base styles', () => {
    expect(pressableBaseStyles).toMatchObject({
      [disabledSelector]: {
        color: 'ink.text-non-interactive',
        cursor: 'not-allowed',
      },
    });
  });

  it('emits the disabled cursor and color classes for a non-pressable element', () => {
    const className = css(pressableBaseStyles);
    expect(className).toContain('cursor_not-allowed');
    expect(className).toContain('c_ink.text-non-interactive');
  });

  it('still emits disabled styling when base is combined with pressable styles (dropdown/select usage)', () => {
    const className = css(pressableBaseStyles, pressableStyles);
    expect(className).toContain('cursor_not-allowed');
    expect(className).toContain('c_ink.text-non-interactive');
    expect(className).toContain('cursor_pointer');
  });
});

describe('Pressable component', () => {
  it('renders disabled visual styling for a disabled item that still has an onClick', () => {
    render(
      <Pressable disabled onClick={vi.fn()}>
        Account
      </Pressable>
    );
    const button = screen.getByRole('button');
    expect(button.className).toContain('cursor_not-allowed');
    expect(button.className).toContain('c_ink.text-non-interactive');
  });

  it('marks a disabled item with the disabled attribute and data-disabled', () => {
    render(
      <Pressable disabled onClick={vi.fn()}>
        Account
      </Pressable>
    );
    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.hasAttribute('data-disabled')).toBe(true);
  });

  it('does not fire onClick while disabled', () => {
    const onClick = vi.fn();
    render(
      <Pressable disabled onClick={onClick}>
        Account
      </Pressable>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('fires onClick and shows the pointer cursor when enabled', () => {
    const onClick = vi.fn();
    render(<Pressable onClick={onClick}>Account</Pressable>);
    const button = screen.getByRole('button');
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.hasAttribute('data-disabled')).toBe(false);
    expect(button.className).toContain('cursor_pointer');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
