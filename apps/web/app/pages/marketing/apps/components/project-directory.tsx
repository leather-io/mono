import { css } from 'leather-styles/css';
import { styled } from 'leather-styles/jsx';
import { iconRadius } from '~/pages/marketing/shared/marketing-radius';
import { trackExternalLinkClick } from '~/utils/external-links';

import { type Project } from '../apps.data';

const line = '{colors.ink.border-default}';

type Corner = 'tl' | 'tr' | 'bl' | 'br';

// Column count per breakpoint, matching gridTemplateColumns below.
const columnsAt = { base: 1, md: 2, lg: 3 } as const;

/** The grid's outer corners that fall on this cell, so the grid reads as one rounded card. */
function outerCorners(index: number, count: number, columns: number) {
  const rows = Math.ceil(count / columns);
  const lastRowStart = (rows - 1) * columns;
  const corners: Corner[] = [];
  if (index === 0) corners.push('tl');
  if (index === Math.min(columns, count) - 1) corners.push('tr');
  if (index === lastRowStart) corners.push('bl');
  if (index === count - 1) corners.push('br');
  // A short last row leaves a step: the cell above the gap closes the right edge.
  if (rows > 1 && count % columns !== 0 && index === lastRowStart - 1) corners.push('br');
  return corners.join(' ');
}

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
  '&[data-corners-base~="tl"]': { borderTopLeftRadius: 'md' },
  '&[data-corners-base~="tr"]': { borderTopRightRadius: 'md' },
  '&[data-corners-base~="bl"]': { borderBottomLeftRadius: 'md' },
  '&[data-corners-base~="br"]': { borderBottomRightRadius: 'md' },
  md: {
    '&[data-corners-base]': { borderRadius: 0 },
    '&[data-corners-md~="tl"]': { borderTopLeftRadius: 'md' },
    '&[data-corners-md~="tr"]': { borderTopRightRadius: 'md' },
    '&[data-corners-md~="bl"]': { borderBottomLeftRadius: 'md' },
    '&[data-corners-md~="br"]': { borderBottomRightRadius: 'md' },
  },
  lg: {
    '&[data-corners-base]': { borderRadius: 0 },
    '&[data-corners-lg~="tl"]': { borderTopLeftRadius: 'md' },
    '&[data-corners-lg~="tr"]': { borderTopRightRadius: 'md' },
    '&[data-corners-lg~="bl"]': { borderBottomLeftRadius: 'md' },
    '&[data-corners-lg~="br"]': { borderBottomRightRadius: 'md' },
  },
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
      {projects.map((project, index) => (
        <li key={project.slug}>
          <a
            href={project.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.name} (opens in a new tab)`}
            className={projectStyles}
            data-corners-base={outerCorners(index, projects.length, columnsAt.base)}
            data-corners-md={outerCorners(index, projects.length, columnsAt.md)}
            data-corners-lg={outerCorners(index, projects.length, columnsAt.lg)}
            onClick={() => trackExternalLinkClick(project.website, { section: 'apps_directory' })}
          >
            <styled.img
              src={project.logo}
              alt=""
              htmlWidth={48}
              htmlHeight={48}
              w="48px"
              h="48px"
              bg="ink.background-secondary"
              outline="1px solid {colors.ink.border-default}"
              outlineOffset="-1px"
              style={{
                borderRadius: iconRadius(48),
                background: project.logoBackground,
                outlineStyle: project.logoBackground === '#FFFFFF' ? 'solid' : 'none',
              }}
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
