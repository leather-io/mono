import { Link } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';

import { ArrowTopRightIcon, Tabs } from '@leather.io/ui';

import {
  type ExplorerApp,
  type FeaturedApp,
  explorerDisclaimer,
  explorerPromo,
  explorerTabs,
  featuredApps,
} from './explorer.data';

const columnPx = 'space.05';

function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

function PromoBanner() {
  const { titleLines, description, ctaLabel, href, art } = explorerPromo;

  return (
    <Link to={href} aria-label={`${titleLines.join(' ')}: ${description}. ${ctaLabel}`}>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        gap="space.03"
        px={columnPx}
        pt="space.07"
        pb="space.05"
      >
        <Flex flexDirection="column" alignItems="flex-start" gap="space.02">
          <styled.h1 textStyle="heading.03" textTransform="uppercase" color="ink.text-primary">
            {titleLines[0]}
            <br />
            {titleLines[1]}
          </styled.h1>
          <styled.p textStyle="body.01" color="ink.text-primary" maxWidth="180px">
            {description}
          </styled.p>
          <styled.span
            mt="space.03"
            px="space.04"
            py="space.02"
            borderRadius="round"
            bg="ink.text-primary"
            color="ink.background-primary"
            textStyle="label.03"
          >
            {ctaLabel}
          </styled.span>
        </Flex>
        <Box position="relative" width="120px" height="150px" flexShrink={0} aria-hidden>
          <styled.img
            src={art.hourglass.src}
            alt={art.hourglass.alt}
            position="absolute"
            bottom="0"
            right="0"
            width="100px"
            height="100px"
          />
          <styled.img
            src={art.creature.src}
            alt={art.creature.alt}
            position="absolute"
            top="0"
            left="0"
            width="92px"
            height="95px"
          />
        </Box>
      </Flex>
    </Link>
  );
}

function FeaturedCard({ app }: { app: FeaturedApp }) {
  return (
    <styled.li flex="0 0 auto" width="300px" scrollSnapAlign="start" scrollMarginLeft="space.05">
      <Link to={app.href}>
        <Flex
          position="relative"
          flexDirection="column"
          justifyContent="flex-end"
          height="300px"
          overflow="hidden"
          bg="ink.text-primary"
          color="ink.background-primary"
          px="space.05"
          pb="space.05"
          _hover={{ '& img[data-cover]': { transform: 'scale(1.03)' } }}
        >
          <styled.img
            data-cover
            src={app.cover}
            alt=""
            loading="lazy"
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="150px"
            objectFit="cover"
            transition="transform 0.3s ease"
          />
          <styled.img
            src={app.logo}
            alt=""
            position="relative"
            width="40px"
            height="40px"
            borderRadius="round"
            mb="space.04"
          />
          <styled.h3 textStyle="label.01" mb="space.02">
            {app.name}
          </styled.h3>
          <Flex alignItems="flex-end" gap="space.04">
            <styled.p textStyle="caption.01" lineClamp={4} flex="1">
              {app.description}
            </styled.p>
            <ArrowTopRightIcon color="ink.background-primary" aria-hidden />
          </Flex>
        </Flex>
      </Link>
    </styled.li>
  );
}

function FeaturedCarousel() {
  return (
    <styled.section aria-label="Featured apps" pt="space.05" pb="space.07">
      <styled.ul
        listStyleType="none"
        display="flex"
        gap="space.03"
        overflowX="auto"
        scrollSnapType="x mandatory"
        px={columnPx}
        css={{ scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}
      >
        {featuredApps.map(app => (
          <FeaturedCard key={app.name} app={app} />
        ))}
      </styled.ul>
    </styled.section>
  );
}

function AppRow({ app }: { app: ExplorerApp }) {
  const content = (
    <Flex alignItems="center" gap="space.03" py="space.04" px={columnPx}>
      <styled.img
        src={app.logo}
        alt=""
        width="40px"
        height="40px"
        borderRadius="xs"
        loading="lazy"
        flexShrink={0}
      />
      <styled.span textStyle="body.02" color="ink.text-primary" flex="1">
        {app.name}
      </styled.span>
      <styled.span
        px="space.03"
        py="space.02"
        borderRadius="round"
        bg="ink.component-background-hover"
        textStyle="label.03"
        color="ink.text-primary"
        aria-hidden
      >
        Open
      </styled.span>
    </Flex>
  );

  return (
    <styled.li _hover={{ bg: 'ink.component-background-hover' }}>
      {isExternal(app.href) ? (
        <a href={app.href} aria-label={`Open ${app.name}`}>
          {content}
        </a>
      ) : (
        <Link to={app.href} aria-label={`Open ${app.name}`}>
          {content}
        </Link>
      )}
    </styled.li>
  );
}

function AppTabs() {
  const [defaultTab] = explorerTabs;

  return (
    <styled.section aria-labelledby="explorer-more-apps">
      <styled.h2
        id="explorer-more-apps"
        textStyle="heading.03"
        textTransform="uppercase"
        color="ink.text-primary"
        px={columnPx}
        mb="space.05"
      >
        More apps to
        <br />
        earn in Stacks
      </styled.h2>
      <Tabs.Root defaultValue={defaultTab?.id}>
        <Tabs.List aria-label="App categories">
          {explorerTabs.map(tab => (
            <Tabs.Trigger key={tab.id} value={tab.id}>
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {explorerTabs.map(tab => (
          <Tabs.Content key={tab.id} value={tab.id}>
            <styled.ul listStyleType="none" py="space.03">
              {tab.apps.map(app => (
                <AppRow key={app.name} app={app} />
              ))}
            </styled.ul>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </styled.section>
  );
}

export function ExplorerPage() {
  return (
    <Box maxWidth="390px" mx="auto" bg="ink.background-primary">
      <PromoBanner />
      <FeaturedCarousel />
      <AppTabs />
      <Box px={columnPx} pb="space.07">
        <styled.p
          textStyle="caption.01"
          color="ink.text-secondary"
          borderTop="default"
          pt="space.05"
        >
          {explorerDisclaimer}
        </styled.p>
      </Box>
    </Box>
  );
}
