// NOTE: All tests in this file are temporarily skipped due to React version mismatch in the monorepo.
// See: https://reactjs.org/link/invalid-hook-call
// Re-enable after standardizing React/ReactDOM versions across all packages.

import { render, screen } from '@testing-library/react';
import { LiquidStackingExplainer } from './liquid-stacking-explainer';
import { content } from '~/data/content';

describe.skip('LiquidStackingExplainer', () => {
  it('renders all explainer steps', () => {
    render(<LiquidStackingExplainer />);
    content.liquidStackingExplainer.forEach(step => {
      expect(screen.getByText(step.title, { exact: false })).toBeInTheDocument();
    });
  });

  it('renders step descriptions from content', () => {
    render(<LiquidStackingExplainer />);
    content.liquidStackingExplainer.forEach(step => {
      expect(screen.getByText(step.description, { exact: false })).toBeInTheDocument();
    });
  });
}); 