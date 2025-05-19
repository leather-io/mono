// NOTE: All tests in this file are temporarily skipped due to React version mismatch in the monorepo.
// See: https://reactjs.org/link/invalid-hook-call
// Re-enable after standardizing React/ReactDOM versions across all packages.

import { render, screen, fireEvent } from '@testing-library/react';
import { PostValueHoverCard } from './post-value-hover-card';

describe.skip('PostValueHoverCard', () => {
  it('renders the value', () => {
    render(<PostValueHoverCard postKey="historical-yield" value="5–8%" />);
    expect(screen.getByText('5–8%')).toBeInTheDocument();
  });

  it('shows hover content on mouse over', async () => {
    render(<PostValueHoverCard postKey="historical-yield" value="5–8%" />);
    fireEvent.mouseOver(screen.getByText('5–8%'));
    expect(await screen.findByText(/learn more/i)).toBeInTheDocument();
  });

  it('handles missing postKey gracefully', () => {
    render(<PostValueHoverCard postKey="nonexistent-key" value="N/A" />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
}); 