import { css, cx } from 'leather-styles/css';
import { Box, Flex, styled } from 'leather-styles/jsx';
import { InstallModal } from '~/pages/marketing/shared/install-modal';

import { type CoreToken } from '../apps.data';

// Outlined pill shared by the "Buy" (button) and "Get" (link) actions.
const pillStyles = css({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  height: '40px',
  px: 'space.04',
  borderRadius: 'round',
  border: '1px solid',
  borderColor: 'ink.text-primary',
  bg: 'ink.background-primary',
  textStyle: 'label.02',
  fontWeight: 400,
  color: 'ink.text-primary',
  transition: 'background-color 120ms ease',
  _hover: { bg: 'ink.component-background-hover' },
  _focusVisible: { outline: '2px solid', outlineColor: 'blue.border', outlineOffset: '2px' },
});

// The whole "Get" card is clickable through the pill link's ::after overlay, so the nested
// "Circle" link stays a valid, separately focusable link.
const stretchedLinkStyles = css({
  _after: { content: '""', position: 'absolute', inset: 0, borderRadius: 'sm' },
});

function renderDescription(token: CoreToken) {
  if (token.action !== 'get' || !token.inlineLink) return token.description;
  const { text, href } = token.inlineLink;
  const [before, after] = token.description.split(text);
  return (
    <>
      {before}
      <styled.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        position="relative"
        zIndex={1}
        textDecoration="underline"
        textUnderlineOffset="2px"
        _hover={{ color: 'ink.action-primary-hover' }}
      >
        {text}
      </styled.a>
      {after}
    </>
  );
}

export function CoreTokenCard({ token }: { token: CoreToken }) {
  return (
    <Flex
      position="relative"
      flexDirection="column"
      gap={['space.04', null, 'space.06']}
      height="100%"
      p="space.05"
      bg="ink.background-secondary"
      border="default"
      borderRadius="sm"
      transition="background-color 120ms ease"
      _hover={token.action === 'get' ? { bg: 'ink.component-background-default' } : undefined}
    >
      <Flex alignItems="center" gap="space.03">
        <styled.img
          src={token.icon}
          alt=""
          htmlWidth={48}
          htmlHeight={48}
          w="48px"
          h="48px"
          borderRadius="round"
          objectFit="cover"
          flexShrink={0}
        />
        <Box flex="1" minW={0}>
          <styled.h3 textStyle="label.01" fontWeight={400}>
            {token.symbol}
          </styled.h3>
          {token.name && (
            <styled.p textStyle="body.02" color="ink.text-subdued">
              {token.name}
            </styled.p>
          )}
        </Box>
        {token.action === 'buy' ? (
          <InstallModal
            trigger={
              <button
                type="button"
                className={pillStyles}
                aria-haspopup="dialog"
                aria-label={`Buy ${token.symbol}: install Leather`}
              >
                Buy
              </button>
            }
          />
        ) : (
          <a
            href={token.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Get ${token.symbol} (opens in a new tab)`}
            className={cx(pillStyles, stretchedLinkStyles)}
          >
            Get
          </a>
        )}
      </Flex>
      <styled.p textStyle="body.02" color="ink.text-secondary" mt="auto">
        {renderDescription(token)}
      </styled.p>
    </Flex>
  );
}
