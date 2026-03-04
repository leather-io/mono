import { Box, Flex, styled } from 'leather-styles/jsx';
import { LearnMoreLink } from '~/layouts/page/page';
import { sanitizeContent } from '~/utils/sanitize-content';

interface SectionHeadingProps {
  title: string;
  sentence?: string;
  disclaimer?: string;
  learnMoreSlug?: string;
  prefix?: string;
}

export function SectionHeading({
  title,
  sentence,
  disclaimer,
  learnMoreSlug,
  prefix,
}: SectionHeadingProps) {
  return (
    <Flex
      flexDir={['column', 'column', 'row']}
      alignItems={['flex-start', 'flex-start', 'flex-start']}
      justifyContent="space-between"
      gap={['space.04', 'space.04', 'space.07']}
      mb="space.07"
      mt="space.07"
    >
      <Box flex={1}>
        <styled.h2 textStyle="heading.03" id={title} maxW="400px" m={0} mr="space.03">
          {prefix}
          {sanitizeContent(title)}
        </styled.h2>
      </Box>
      <Flex
        flexDir="column"
        alignItems={['flex-start', 'flex-start', 'flex-end']}
        maxW={['100%', '100%', '60%']}
        flex={1}
      >
        <Flex alignItems="flex-start" gap="space.02">
          {sentence && (
            <styled.p textStyle="body.01" mb="space.01" display="inline" whiteSpace="pre-line">
              {sanitizeContent(sentence)}
              {learnMoreSlug && <LearnMoreLink destination={learnMoreSlug} />}
            </styled.p>
          )}
        </Flex>
        {disclaimer && (
          <styled.p
            textStyle="body.02"
            color="ink.text-subdued-secondary"
            mb="space.01"
            borderRadius="sm"
          >
            {sanitizeContent(disclaimer)}
          </styled.p>
        )}
      </Flex>
    </Flex>
  );
}
