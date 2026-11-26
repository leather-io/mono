import { styled } from 'leather-styles/jsx';

import { Link } from '@leather.io/ui';

interface InlineLearnMoreLinkProps {
  href: string;
  subject?: string;
  openInNewTab?: boolean;
}

export function InlineLearnMoreLink({
  href,
  subject,
  openInNewTab = true,
}: InlineLearnMoreLinkProps) {
  return (
    <styled.span>
      {' '}
      <Link
        href={href}
        aria-label={subject ? `Learn more about ${subject}` : undefined}
        {...(openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        style={{ fontSize: 'inherit', display: 'inline', whiteSpace: 'nowrap' }}
      >
        Learn more
      </Link>
    </styled.span>
  );
}
