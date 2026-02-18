import { useState } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

import { Badge } from '@leather.io/ui';

type ProjectStatus = 'complete' | 'in-progress' | 'planning' | 'planned' | 'cancelled';

interface Project {
  title: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
}

interface YearData {
  year: number;
  objectives: string[];
  projects: Project[];
}

const roadmapData: YearData[] = [
  {
    year: 2025,
    objectives: [
      'Expand Bitcoin capabilities with advanced transaction features',
      'Improve user experience with streamlined onboarding',
      'Strengthen security infrastructure with multi-signature support',
      'Build developer tools for third-party integrations',
    ],
    projects: [
      {
        title: 'Multi-Signature Wallet Support',
        description:
          'Add support for multi-signature wallets to provide enhanced security for high-value accounts and institutional users.',
        status: 'in-progress',
        startDate: '2025-01-15',
        endDate: '2025-04-30',
      },
      {
        title: 'Hardware Wallet Integration',
        description:
          'Direct integration with Ledger and Trezor devices for cold storage capabilities within the Leather interface.',
        status: 'planning',
        startDate: '2025-03-01',
        endDate: '2025-06-30',
      },
      {
        title: 'Advanced Transaction Builder',
        description:
          'Build a visual transaction builder for complex Bitcoin transactions including batch sends and custom fee controls.',
        status: 'planned',
        startDate: '2025-05-01',
        endDate: '2025-08-30',
      },
      {
        title: 'Developer SDK',
        description:
          'Release a comprehensive SDK for developers to integrate Leather wallet functionality into their applications.',
        status: 'planned',
        startDate: '2025-07-01',
        endDate: '2025-10-30',
      },
      {
        title: 'Mobile App Redesign',
        description:
          'Complete redesign of the mobile application with improved navigation and performance optimizations.',
        status: 'planning',
        startDate: '2025-06-01',
        endDate: '2025-09-30',
      },
    ],
  },
  {
    year: 2024,
    objectives: [
      'Launch browser extension with full Bitcoin and Stacks support',
      'Implement sBTC integration for seamless Bitcoin DeFi',
      'Achieve 100k active users milestone',
      'Establish Leather as the primary wallet for Stacks ecosystem',
    ],
    projects: [
      {
        title: 'Browser Extension Launch',
        description:
          'Released Leather as a browser extension for Chrome, Firefox, and Brave with full Bitcoin and Stacks wallet functionality.',
        status: 'complete',
        startDate: '2024-01-10',
        endDate: '2024-03-15',
      },
      {
        title: 'sBTC Integration',
        description:
          'Integrated sBTC protocol to enable Bitcoin-backed DeFi operations on the Stacks network with one-way peg support.',
        status: 'complete',
        startDate: '2024-04-01',
        endDate: '2024-07-20',
      },
      {
        title: 'NFT Gallery',
        description:
          'Built a dedicated NFT gallery view for displaying and managing Stacks-based NFT collections.',
        status: 'complete',
        startDate: '2024-05-15',
        endDate: '2024-08-10',
      },
      {
        title: 'Swap Interface',
        description:
          'Created an integrated swap interface for exchanging tokens within the wallet without leaving the application.',
        status: 'complete',
        startDate: '2024-08-01',
        endDate: '2024-11-05',
      },
      {
        title: 'Desktop Application',
        description:
          'Native desktop application for macOS and Windows with enhanced security and performance.',
        status: 'cancelled',
        startDate: '2024-09-01',
        endDate: '2024-12-31',
      },
    ],
  },
  {
    year: 2023,
    objectives: [
      'Establish Leather brand and migrate from Hiro Wallet',
      'Build core wallet infrastructure',
      'Implement basic Bitcoin and Stacks functionality',
      'Launch web application beta',
    ],
    projects: [
      {
        title: 'Brand Launch',
        description:
          'Rebranded from Hiro Wallet to Leather, establishing new visual identity and positioning in the market.',
        status: 'complete',
        startDate: '2023-01-05',
        endDate: '2023-02-20',
      },
      {
        title: 'Web Wallet Beta',
        description:
          'Launched web-based wallet application with basic send, receive, and transaction history features.',
        status: 'complete',
        startDate: '2023-03-01',
        endDate: '2023-06-15',
      },
      {
        title: 'Stacks DeFi Integration',
        description:
          'Added support for interacting with major Stacks DeFi protocols including ALEX and Arkadiko.',
        status: 'complete',
        startDate: '2023-06-20',
        endDate: '2023-09-30',
      },
      {
        title: 'Security Audit',
        description:
          'Conducted comprehensive security audit with third-party firm to ensure wallet safety and identify vulnerabilities.',
        status: 'complete',
        startDate: '2023-08-01',
        endDate: '2023-10-15',
      },
      {
        title: 'Mobile Prototype',
        description:
          'Built initial mobile wallet prototype for iOS to test mobile-first design patterns.',
        status: 'complete',
        startDate: '2023-10-01',
        endDate: '2023-12-20',
      },
    ],
  },
];

const statusBadgeVariant: Record<
  ProjectStatus,
  'success' | 'info' | 'warning' | 'default' | 'error'
> = {
  complete: 'success',
  'in-progress': 'info',
  planning: 'warning',
  planned: 'default',
  cancelled: 'error',
};

const statusLabel: Record<ProjectStatus, string> = {
  complete: 'Complete',
  'in-progress': 'In Progress',
  planning: 'Planning',
  planned: 'Planned',
  cancelled: 'Cancelled',
};

const statusColor: Record<ProjectStatus, string> = {
  complete: '#059669',
  'in-progress': '#2563eb',
  planning: '#8b5cf6',
  planned: '#64748b',
  cancelled: '#dc2626',
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const yearButtonStyles = css({
  px: 'space.03',
  py: 'space.02',
  textStyle: 'label.02',
  color: 'ink.text-subdued',
  bg: 'transparent',
  border: '1px solid {colors.ink.border-default}',
  borderRadius: 'sm',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  _hover: {
    bg: 'ink.component-background-hover',
    color: 'ink.text-primary',
  },
});

const yearButtonActiveStyles = css({
  bg: 'ink.text-primary',
  color: 'ink.background-primary',
  borderColor: 'ink.text-primary',
  _hover: {
    bg: 'ink.text-primary',
    color: 'ink.background-primary',
  },
});

const filterButtonStyles = css({
  px: 'space.03',
  py: 'space.02',
  textStyle: 'label.02',
  color: 'ink.text-subdued',
  bg: 'transparent',
  border: '1px solid {colors.ink.border-default}',
  borderRadius: 'sm',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  textTransform: 'capitalize',
  _hover: {
    bg: 'ink.component-background-hover',
  },
});

const filterButtonActiveStyles = css({
  borderColor: 'ink.text-primary',
  bg: 'ink.component-background-hover',
  color: 'ink.text-primary',
});

const timelineStyles = css({
  position: 'relative',
  pl: 'space.06',
  _before: {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '2px',
    bg: 'ink.border-default',
  },
});

const timelineItemStyles = css({
  position: 'relative',
  pb: 'space.07',
  _last: {
    pb: 0,
  },
});

const projectCardStyles = css({
  bg: 'ink.background-primary',
  border: '1px solid {colors.ink.border-default}',
  borderRadius: 'sm',
  p: 'space.05',
  transition: 'all 0.2s ease',
  _hover: {
    borderColor: 'ink.text-subdued',
    boxShadow: '0 4px 12px rgba(18, 16, 15, 0.08)',
  },
});

interface TimelineMarkerProps {
  status: ProjectStatus;
}

function TimelineMarker({ status }: TimelineMarkerProps) {
  return (
    <styled.div
      position="absolute"
      left="-30px"
      top="space.03"
      width="12px"
      height="12px"
      borderRadius="50%"
      zIndex={1}
      style={{
        background: statusColor[status],
      }}
    />
  );
}

interface ObjectivesSectionProps {
  objectives: string[];
}

function ObjectivesSection({ objectives }: ObjectivesSectionProps) {
  return (
    <Box bg="ink.background-secondary" borderRadius="sm" p="space.05" mb="space.07">
      <styled.h3 textStyle="heading.05" mb="space.04">
        Objectives
      </styled.h3>
      <Flex flexDir="column" gap="space.03">
        {objectives.map((objective, index) => (
          <Flex key={index} alignItems="flex-start" gap="space.03">
            <Flex
              alignItems="center"
              justifyContent="center"
              width="28px"
              height="28px"
              bg="ink.text-primary"
              color="ink.background-primary"
              borderRadius="50%"
              textStyle="label.03"
              flexShrink={0}
              mt="2px"
            >
              {index + 1}
            </Flex>
            <styled.span textStyle="body.01" color="ink.text-subdued" lineHeight="1.7">
              {objective}
            </styled.span>
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className={timelineItemStyles}>
      <TimelineMarker status={project.status} />
      <div className={projectCardStyles}>
        <Flex
          justifyContent="space-between"
          alignItems={['flex-start']}
          mb="space.03"
          gap="space.03"
          flexDir={['column', 'row']}
        >
          <styled.h3 textStyle="heading.05" letterSpacing="-0.01em">
            {project.title}
          </styled.h3>
          <Badge label={statusLabel[project.status]} variant={statusBadgeVariant[project.status]} />
        </Flex>
        <styled.p textStyle="body.01" color="ink.text-subdued" lineHeight="1.7" mb="space.03">
          {project.description}
        </styled.p>
        <Flex gap="space.05" textStyle="label.02" color="ink.text-subdued">
          <Flex alignItems="center" gap="space.01">
            <styled.span fontWeight={500}>Start:</styled.span>
            <span>{formatDate(project.startDate)}</span>
          </Flex>
          <Flex alignItems="center" gap="space.01">
            <styled.span fontWeight={500}>End:</styled.span>
            <span>{formatDate(project.endDate)}</span>
          </Flex>
        </Flex>
      </div>
    </div>
  );
}

interface StatusFilterProps {
  activeFilter: string;
  statuses: ProjectStatus[];
  onFilterChange(filter: string): void;
}

function StatusFilter({ activeFilter, statuses, onFilterChange }: StatusFilterProps) {
  return (
    <Flex gap="space.02" mb="space.05" flexWrap="wrap">
      <button
        className={`${filterButtonStyles} ${activeFilter === 'all' ? filterButtonActiveStyles : ''}`}
        onClick={() => onFilterChange('all')}
      >
        All Projects
      </button>
      {statuses.map(status => (
        <button
          key={status}
          className={`${filterButtonStyles} ${activeFilter === status ? filterButtonActiveStyles : ''}`}
          onClick={() => onFilterChange(status)}
        >
          {statusLabel[status]}
        </button>
      ))}
    </Flex>
  );
}

export function RoadmapPage() {
  const [activeYear, setActiveYear] = useState(roadmapData[0].year);
  const [activeFilter, setActiveFilter] = useState('all');

  const currentYearData = roadmapData.find(y => y.year === activeYear);
  if (!currentYearData) return null;

  const uniqueStatuses = [...new Set(currentYearData.projects.map(p => p.status))];
  const filteredProjects =
    activeFilter === 'all'
      ? currentYearData.projects
      : currentYearData.projects.filter(p => p.status === activeFilter);

  function handleYearChange(year: number) {
    setActiveYear(year);
    setActiveFilter('all');
  }

  return (
    <Page>
      <styled.header pb="space.05" borderBottom="default">
        <Flex
          justifyContent="space-between"
          alignItems={['flex-start', 'center']}
          mb="space.05"
          flexDir={['column', 'row']}
          gap="space.04"
        >
          <styled.h1 textStyle="heading.02" letterSpacing="-0.02em">
            Product Roadmap
          </styled.h1>
          <Flex gap="space.02" flexWrap="wrap">
            {roadmapData.map(yearData => (
              <button
                key={yearData.year}
                className={`${yearButtonStyles} ${yearData.year === activeYear ? yearButtonActiveStyles : ''}`}
                onClick={() => handleYearChange(yearData.year)}
              >
                {yearData.year}
              </button>
            ))}
          </Flex>
        </Flex>
        <styled.p textStyle="body.01" color="ink.text-subdued" lineHeight="1.7" maxW="800px">
          Track our progress and upcoming projects. We maintain transparency with our community by
          sharing what we're building, when we're building it, and what we've accomplished.
        </styled.p>
      </styled.header>

      <Box py="space.07">
        <styled.h2 textStyle="heading.03" mb="space.05" letterSpacing="-0.02em">
          {currentYearData.year}
        </styled.h2>

        <ObjectivesSection objectives={currentYearData.objectives} />

        <StatusFilter
          activeFilter={activeFilter}
          statuses={uniqueStatuses}
          onFilterChange={setActiveFilter}
        />

        <div className={timelineStyles}>
          {filteredProjects.map(project => (
            <ProjectCard key={project.title} project={project} />
          ))}

          {filteredProjects.length === 0 && (
            <div className={projectCardStyles}>
              <styled.p textStyle="body.01" color="ink.text-subdued" textAlign="center">
                No projects match this filter.
              </styled.p>
            </div>
          )}
        </div>
      </Box>
    </Page>
  );
}
