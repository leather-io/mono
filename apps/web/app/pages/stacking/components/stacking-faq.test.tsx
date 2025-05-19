// NOTE: All tests in this file are temporarily skipped due to React version mismatch in the monorepo.
// See: https://reactjs.org/link/invalid-hook-call
// Re-enable after standardizing React/ReactDOM versions across all packages.

import { render, screen } from '@testing-library/react';
import { StackingFaq } from './stacking-faq';

describe.skip('StackingFaq', () => {
  it('renders FAQ items from content', () => {
    render(<StackingFaq />);
    // Check for a known question from content
    expect(screen.getByText(/What is stacking/i)).toBeInTheDocument();
  });

  it('handles missing/invalid posts gracefully', () => {
    render(<StackingFaq />);
    // Should not throw or crash
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
}); 