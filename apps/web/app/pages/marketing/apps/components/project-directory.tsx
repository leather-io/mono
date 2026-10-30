import { Link } from 'react-router';

import { css } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';

import { type Project } from '../apps.data';

const projectLinkStyles = css({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  p: 'space.05',
  transition: 'background-color 120ms ease',
  _hover: { bg: 'ink.component-background-hover' },
  _focusVisible: { outline: '2px solid', outlineColor: 'blue.border', outlineOffset: '-2px' },
});

/** Bordered 3-column directory of every published app, each linking to its post. */
export function ProjectDirectory({ projects }: { projects: Project[] }) {
  return (
    <styled.ul
      display="grid"
      gridTemplateColumns={['1fr', null, 'repeat(2, 1fr)', 'repeat(3, 1fr)']}
      border="default"
      borderRadius="sm"
      overflow="hidden"
    >
      {projects.map(project => (
        // Hairline dividers between cells that hold for every column count
        <styled.li key={project.slug} boxShadow="-1px -1px 0 0 {colors.ink.border-default}">
          <Link to={`/posts/${project.postSlug}`} className={projectLinkStyles}>
            <styled.img
              src={project.logo}
              alt=""
              htmlWidth={48}
              htmlHeight={48}
              w="48px"
              h="48px"
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
          </Link>
        </styled.li>
      ))}
    </styled.ul>
  );
}
