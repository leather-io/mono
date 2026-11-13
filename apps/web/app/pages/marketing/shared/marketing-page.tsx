import { type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { type HTMLStyledProps, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';
import { HomeKeyNotice } from '~/pages/marketing/home/components/home-key-notice';

interface MarketingPageProps extends Omit<HTMLStyledProps<'div'>, 'title'> {
  /** Shown in the top bar (e.g. "Developers", "News", "Explore"). Omit on pages without one. */
  title?: string;
  /** Back arrow in the top bar, as on /posts, /news and /developers. */
  showBack?: boolean;
  children: ReactNode;
}

/** Page shell for marketing pages: the app's top bar, then the content with a bottom gutter. */
export function MarketingPage({ title, showBack, children, ...props }: MarketingPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  // location.key is "default" on the first page of a session, so there's nothing to go back to
  const hasHistory = location.key !== 'default';

  function handleBack() {
    if (hasHistory) void navigate(-1);
    else void navigate('/');
  }

  return (
    <Page {...props}>
      <Page.Header
        title={title}
        onBack={showBack ? handleBack : undefined}
        notice={location.pathname === '/' ? <HomeKeyNotice /> : undefined}
      />
      <styled.div pb={['space.09', null, 'space.11']}>{children}</styled.div>
    </Page>
  );
}
