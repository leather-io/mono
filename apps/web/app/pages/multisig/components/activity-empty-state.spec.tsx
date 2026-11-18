// @vitest-environment jsdom
import { type ReactElement, act } from 'react';
import { createRoot } from 'react-dom/client';

import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ActivityEmptyState } from './activity-empty-state';

const mounted: { root: ReturnType<typeof createRoot>; container: HTMLElement }[] = [];

function mount(element: ReactElement) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(element);
  });
  mounted.push({ root, container });
  return container;
}

beforeAll(() => {
  Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
});

afterEach(() => {
  while (mounted.length) {
    const instance = mounted.pop();
    if (!instance) continue;
    act(() => {
      instance.root.unmount();
    });
    instance.container.remove();
  }
});

describe('ActivityEmptyState', () => {
  it('renders the default title when none is provided', () => {
    const container = mount(<ActivityEmptyState />);
    expect(container.textContent).toContain('No activity yet');
  });

  it('renders a custom title when provided', () => {
    const container = mount(<ActivityEmptyState title="No transactions yet" />);
    expect(container.textContent).toContain('No transactions yet');
  });

  it('renders the description when provided', () => {
    const container = mount(
      <ActivityEmptyState description="Transactions for this vault will appear here." />
    );
    expect(container.textContent).toContain('Transactions for this vault will appear here.');
  });

  it('omits the description when not provided', () => {
    const container = mount(<ActivityEmptyState />);
    expect(container.textContent).not.toContain('will appear here');
  });

  it('renders both the light and dark illustration sources for the theme swap', () => {
    const container = mount(<ActivityEmptyState />);
    const sources = Array.from(container.querySelectorAll('img')).map(img =>
      img.getAttribute('src')
    );
    expect(sources).toContain('/multisig/illustrations/no-activity.png');
    expect(sources).toContain('/multisig/illustrations/no-activity-dark.png');
  });

  it('marks both illustrations as decorative so the caption carries the label', () => {
    const container = mount(<ActivityEmptyState />);
    const images = Array.from(container.querySelectorAll('img'));
    expect(images).toHaveLength(2);
    images.forEach(img => expect(img.getAttribute('alt')).toBe(''));
  });
});
