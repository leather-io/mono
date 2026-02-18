import { Box, styled } from 'leather-styles/jsx';

import { ArrowLeftIcon } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';
import { useNavigate } from '@app/routes/compat';

interface TokenDetailsHeaderProps {
  title: string;
}

export function TokenDetailsHeader({ title }: TokenDetailsHeaderProps) {
  const navigate = useNavigate();
  return (
    <Header px={['space.03', null, 'space.00']}>
      <Box width="100%" maxWidth={['100%', null, '780px']} margin="0 auto">
        <HeaderGrid
          leftCol={
            <HeaderActionButton
              icon={<ArrowLeftIcon />}
              onAction={() => navigate(RouteUrls.Home)}
              dataTestId="token-details-back"
            />
          }
          centerCol={
            <styled.span textStyle="heading.05" data-testid="token-details-title">
              {title}
            </styled.span>
          }
        />
      </Box>
    </Header>
  );
}
