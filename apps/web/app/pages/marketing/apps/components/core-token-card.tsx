import { css, cx } from 'leather-styles/css';
import { Flex, styled } from 'leather-styles/jsx';
import { InstallModal } from '~/pages/marketing/shared/install-modal';

import { type CoreToken } from '../apps.data';
import { pillStyles } from './pill-styles';

// The whole card hovers as one, so its pill follows the card's hover too.
const cardPillStyles = cx(
  pillStyles,
  css({ _groupHover: { bg: 'ink.component-background-hover' } })
);

// Every card is clickable as a whole through its pill's ::after overlay, so the nested
// "Circle" link stays a valid, separately focusable link.
const stretchedLinkStyles = css({
  _after: { content: '""', position: 'absolute', inset: 0, borderRadius: 'md' },
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
      borderRadius="md"
      transition="background-color 120ms ease"
      className="group"
      cursor="pointer"
      _hover={{ bg: 'ink.component-background-default' }}
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
        <styled.h3 flex="1" minW={0} textStyle="label.01" fontWeight={400}>
          {token.name}
        </styled.h3>
        {token.action === 'buy' ? (
          <InstallModal
            section="apps_core_token"
            trigger={
              <button
                type="button"
                className={cx(cardPillStyles, stretchedLinkStyles)}
                aria-haspopup="dialog"
                aria-label={`Buy ${token.name}: install Leather`}
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
            aria-label={`Get ${token.name} (opens in a new tab)`}
            className={cx(cardPillStyles, stretchedLinkStyles)}
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
