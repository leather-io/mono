import { Box, type BoxProps, styled } from 'leather-styles/jsx';

import { ArrowLeftIcon } from '@leather.io/ui';

import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';

interface DetailsHeaderProps {
  title: string;
  onBack(): void;
  backTestId: string;
  titleTestId: string;
  px?: BoxProps['px'];
}

export function DetailsHeader({
  title,
  onBack,
  backTestId,
  titleTestId,
  px = ['space.03', null, 'space.00'],
}: DetailsHeaderProps) {
  return (
    <Header px={px}>
      <Box width="100%" maxWidth={['100%', null, '780px']} margin="0 auto">
        <HeaderGrid
          leftCol={
            <HeaderActionButton
              icon={<ArrowLeftIcon />}
              onAction={onBack}
              dataTestId={backTestId}
            />
          }
          centerCol={
            <styled.span textStyle="heading.05" data-testid={titleTestId}>
              {title}
            </styled.span>
          }
        />
      </Box>
    </Header>
  );
}
