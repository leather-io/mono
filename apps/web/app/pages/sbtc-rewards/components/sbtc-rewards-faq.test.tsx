// NOTE: All tests in this file are temporarily skipped due to React version mismatch in the monorepo.
// See: https://reactjs.org/link/invalid-hook-call
// Re-enable after standardizing React/ReactDOM versions across all packages.

import { render, screen } from '@testing-library/react';
import { SbtcRewardsFaq } from './sbtc-rewards-faq';

describe.skip('SbtcRewardsFaq', () => {
  it('renders FAQ items from content', () => {
    render(<SbtcRewardsFaq />);
    // Check for a known question from content
    expect(screen.getByText(/What is sBTC/i)).toBeInTheDocument();
  });

  it('handles missing/invalid posts gracefully', () => {
    render(<SbtcRewardsFaq />);
    // Should not throw or crash
    expect(screen.getByRole('region')).toBeInTheDocument();
  });
}); 