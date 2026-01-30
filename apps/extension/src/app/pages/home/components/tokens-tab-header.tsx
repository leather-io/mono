import { useNavigate } from 'react-router';

import { HomePageSelectors } from '@tests/selectors/home.selectors';
import { Box, Flex, styled } from 'leather-styles/jsx';

import {
  Flag,
  IconButton,
  InfoCircleIcon,
  SettingsSliderIcon,
  SkeletonLoader,
} from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { formatCurrency } from '@app/common/currency-formatter';
import { emptyAmountPlaceholder } from '@app/components/balance/constants';
import { PrivateTextLayout } from '@app/components/privacy/private-text.layout';
import { BasicTooltip } from '@app/ui/components/tooltip/basic-tooltip';

import { useHomePageState } from '../use-home-page-state';

const availableBalanceTooltipLabel =
  'The amount of tokens available to send, excluding any locked amounts.';

export function TokensTabHeader() {
  const navigate = useNavigate();
  const { availableBalance, isPrivateMode, togglePrivateMode } = useHomePageState();

  const isLoadingBalance = availableBalance.state === 'loading';
  const availableBalanceFormatted =
    availableBalance.state !== 'success'
      ? emptyAmountPlaceholder
      : formatCurrency(availableBalance.value);

  return (
    <Flex justifyContent="space-between" alignItems="flex-start">
      <Box>
        <BasicTooltip side="right" label={availableBalanceTooltipLabel}>
          <Flag
            reverse
            spacing="space.01"
            img={<InfoCircleIcon color="ink.text-subdued" display="inline" variant="small" />}
          >
            <styled.span textStyle="label.02">Available</styled.span>
          </Flag>
        </BasicTooltip>
        <Box pt="space.01">
          <SkeletonLoader width="150px" height="28px" isLoading={isLoadingBalance}>
            <styled.h2 textStyle="heading.05" data-testid={HomePageSelectors.AvailableBalance}>
              <PrivateTextLayout
                isPrivate={isPrivateMode}
                onShowValue={togglePrivateMode}
                display="inline-block"
              >
                {availableBalanceFormatted}
              </PrivateTextLayout>
            </styled.h2>
          </SkeletonLoader>
        </Box>
      </Box>
      <IconButton
        data-testid={HomePageSelectors.ManageTokensBtn}
        icon={<SettingsSliderIcon variant="small" />}
        onClick={() => navigate(RouteUrls.ManageTokens)}
        width="40px"
        height="40px"
      />
    </Flex>
  );
}
