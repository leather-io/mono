import { type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { type HTMLStyledProps, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

interface MarketingPageProps extends Omit<HTMLStyledProps<'div'>, 'title'> {
  /** Shown in the top bar (e.g. "Developers", "News", "Explore"). Omit on pages without one. */
  title?: string;
  /** Back arrow in the top bar, as on /posts, /news and /developers. */
  showBack?: boolean;
  /** Where the back arrow goes when there is no in-app history (direct landing). Defaults to "/". */
  backFallback?: string;
  children: ReactNode;
}

/**
 * Page shell for marketing pages inside the app chrome: the app's top bar (optional back arrow +
 * page title as the page's <h1>, and the app-wide Install / Connect slot on the right, where
 * Install opens the "Choose the platform" modal), then the page content with a bottom gutter
 * before the footer. Content width comes from the root layout (max 1200px), as on every app page.
 */
export function MarketingPage({
  title,
  showBack,
  backFallback = '/',
  children,
  ...props
}: MarketingPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  // location.key is "default" on the first page of a session, so there's nothing to go back to
  const hasHistory = location.key !== 'default';

  function handleBack() {
    if (hasHistory) void navigate(-1);
    else void navigate(backFallback);
  }

  return (
    <Page {...props}>
      <Page.Header title={title} onBack={showBack ? handleBack : undefined} />
      <styled.div pb={['space.09', null, 'space.11']}>{children}</styled.div>
    </Page>
  );
}
