import { useNavigate } from 'react-router';

import { RouteUrls } from '@shared/route-urls';

import { DetailsHeader } from '@app/components/details/details-header';

interface TokenDetailsHeaderProps {
  title: string;
}

export function TokenDetailsHeader({ title }: TokenDetailsHeaderProps) {
  const navigate = useNavigate();
  return (
    <DetailsHeader
      title={title}
      onBack={() => navigate(RouteUrls.Home)}
      backTestId="token-details-back"
      titleTestId="token-details-title"
    />
  );
}
