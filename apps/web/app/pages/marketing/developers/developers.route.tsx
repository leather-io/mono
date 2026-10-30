import { Link } from 'react-router';

import { css } from 'leather-styles/css';
import { Box, Flex, styled } from 'leather-styles/jsx';
import { HelpCards } from '~/pages/marketing/shared/help-cards';
import { marketingHeaders, marketingMeta } from '~/pages/marketing/shared/marketing-meta';
import { MarketingPage } from '~/pages/marketing/shared/marketing-page';

import { developerDocs, developerDocsHeading, developersIntro } from './developers.data';

export const headers = marketingHeaders;

export function meta() {
  return marketingMeta({ title: 'Developers – Leather', path: '/developers' });
}

const docLinkStyles = css({
  display: 'inline-block',
  py: 'space.02',
  textStyle: 'body.02',
  fontWeight: 500,
  color: 'ink.text-primary',
  textDecoration: 'underline',
  textDecorationColor: 'transparent',
  textUnderlineOffset: '4px',
  transition: 'text-decoration-color 0.15s ease',
  _hover: { textDecorationColor: 'ink.underline' },
  _focusVisible: { outline: '2px solid', outlineColor: 'blue.border', outlineOffset: '2px' },
});

export default function DevelopersRoute() {
  return (
    <MarketingPage title="Developers" showBack>
      <Flex
        flexDirection={['column', null, 'row']}
        gap={['space.05', null, 'space.08']}
        pt={['space.05', null, 'space.07']}
        pb={['space.06', null, 'space.07']}
      >
        <styled.h2 flex="1" textStyle="heading.03" maxW="440px">
          {developersIntro.title}
        </styled.h2>
        <styled.p flex="1" textStyle="body.02" lineHeight="20px" color="ink.text-primary">
          {developersIntro.description}
        </styled.p>
      </Flex>

      <Box className="dark" bg="ink.background-primary" overflow="hidden">
        <styled.img
          src="/marketing/developers/hero-illustration.webp"
          alt="Line illustration of documents, a folder, a laptop and a desk lamp, with an arm pulling a file from a box"
          htmlWidth={2560}
          htmlHeight={458}
          fetchPriority="high"
          decoding="async"
          display="block"
          w="100%"
          h={['255px', null, '280px']}
          objectFit={['cover', null, 'contain']}
          objectPosition="56% center"
        />
      </Box>

      <styled.section pt={['space.06', null, 'space.08']} pb={['space.06', null, 'space.07']}>
        <styled.h2 textStyle="heading.04" fontWeight={400}>
          {developerDocsHeading}
        </styled.h2>
        <styled.ul mt={['space.04', null, 'space.06']} display="flex" flexDirection="column">
          {developerDocs.map(doc => (
            <li key={doc.slug}>
              <Link to={`/posts/${doc.slug}`} className={docLinkStyles}>
                {doc.title}
              </Link>
            </li>
          ))}
        </styled.ul>
      </styled.section>

      <HelpCards />
    </MarketingPage>
  );
}
