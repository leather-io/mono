import { css } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';
import { trackExternalLinkClick } from '~/utils/external-links';

import { type Project } from '../apps.data';

const line = '{colors.ink.border-default}';

// Each cell draws its own top/left lines inside and right/bottom lines outside its box, so
// neighbours share a single hairline and a short last row ends with closed cells, not empty ones.
const projectStyles = css({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  p: 'space.05',
  boxShadow: `1px 0 0 0 ${line}, 0 1px 0 0 ${line}, 1px 1px 0 0 ${line}, inset 1px 0 0 0 ${line}, inset 0 1px 0 0 ${line}`,
  transition: 'background-color 120ms ease',
  _hover: { bg: 'ink.component-background-hover' },
  _focusVisible: { outline: '2px solid', outlineColor: 'blue.border', outlineOffset: '-2px' },
});

/** 3-column directory of every published app, each linking to the app's site. */
export function ProjectDirectory({ projects }: { projects: Project[] }) {
  return (
    <styled.ul
      display="grid"
      gridTemplateColumns={['1fr', null, 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
      pr="1px"
      pb="1px"
    >
      {projects.map(project => (
        <li key={project.slug}>
          <a
            href={project.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.name} (opens in a new tab)`}
            className={projectStyles}
            onClick={() => trackExternalLinkClick(project.website, { section: 'apps_directory' })}
          >
            <styled.img
              src={project.logo}
              alt=""
              htmlWidth={48}
              htmlHeight={48}
              w="48px"
              h="48px"
              borderRadius="round"
              bg="ink.background-secondary"
              objectFit="cover"
              loading="lazy"
              decoding="async"
            />
            <styled.h3 textStyle="label.01" fontWeight={400} mt="space.04">
              {project.name}
            </styled.h3>
            <styled.p
              textStyle="caption.01"
              lineHeight="16px"
              color="ink.text-secondary"
              mt="space.02"
            >
              {project.description}
            </styled.p>
          </a>
        </li>
      ))}
    </styled.ul>
  );
}
