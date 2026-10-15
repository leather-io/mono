import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { BroadcastError } from './broadcast-error';

const h = vi.hoisted((): { state: unknown } => ({ state: null }));

vi.mock('react-router', () => ({
  useLocation: () => ({ state: h.state }),
  useNavigate: () => vi.fn(),
}));

vi.mock('@shared/utils/analytics', () => ({ analytics: { track: vi.fn() } }));

vi.mock('@leather.io/ui', () => ({
  Sheet({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  },
  SheetHeader() {
    return null;
  },
}));

vi.mock('./components/broadcast-error.layout', () => ({
  BroadcastErrorLayout({ title, errorPayload }: { title: string; errorPayload: React.ReactNode }) {
    return (
      <div>
        <h1>{title}</h1>
        <pre>{errorPayload}</pre>
      </div>
    );
  },
}));

describe(BroadcastError.name, () => {
  beforeEach(() => {
    h.state = null;
  });

  test('shows the error message and propose title from route state', () => {
    h.state = { error: { message: 'insufficient funds' }, proposeMode: true };

    render(<BroadcastError />);

    expect(screen.getByText('There was an error proposing your transaction')).toBeDefined();
    expect(screen.getByText('insufficient funds')).toBeDefined();
  });

  test('falls back to an unknown error when the route has no state', () => {
    h.state = undefined;

    render(<BroadcastError />);

    expect(screen.getByText('There was an error broadcasting your transaction')).toBeDefined();
    expect(screen.getByText('Unknown error response')).toBeDefined();
  });

  test('falls back to an unknown error when the route state is malformed', () => {
    h.state = { error: 'not an object', proposeMode: 'yes' };

    render(<BroadcastError />);

    expect(screen.getByText('There was an error broadcasting your transaction')).toBeDefined();
    expect(screen.getByText('Unknown error response')).toBeDefined();
  });
});
