import { Stack, styled } from 'leather-styles/jsx';

import { ArrowLeftIcon } from '@leather.io/ui';

import { Header } from '@app/components/layout/headers/header';
import { HeaderActionButton } from '@app/components/layout/headers/header-action-button';
import { HeaderGrid } from '@app/components/layout/headers/header-grid';

interface CollectibleTitleProps {
  title: string;
  subtitle?: string;
}

function CollectibleTitle({ title, subtitle }: CollectibleTitleProps) {
  return (
    <Stack alignItems="center" gap="space.01">
      <styled.span textStyle="heading.05">{title}</styled.span>
      {subtitle ? (
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          {subtitle}
        </styled.span>
      ) : null}
    </Stack>
  );
}

interface CollectibleDetailsHeaderProps {
  title: string;
  subtitle?: string;
  onBack(): void;
}

export function CollectibleDetailsHeader({
  title,
  subtitle,
  onBack,
}: CollectibleDetailsHeaderProps) {
  return (
    <Header px={{ base: 'space.04', md: 'space.00' }}>
      <HeaderGrid
        leftCol={
          <HeaderActionButton
            icon={<ArrowLeftIcon />}
            onAction={onBack}
            dataTestId="collectible-details-back"
          />
        }
        centerCol={<CollectibleTitle title={title} subtitle={subtitle} />}
      />
    </Header>
  );
}
