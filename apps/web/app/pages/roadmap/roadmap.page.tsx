import { useState } from 'react';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

import type { RoadmapProject, RoadmapYearsQueryResult } from '@leather.io/cms';
import { Badge } from '@leather.io/ui';

type ProjectStatus = RoadmapProject['status'];

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

function formatDate(dateString?: string) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface YearButtonProps {
  year: number;
  isActive: boolean;
  onClick(): void;
}

function YearButton({ year, isActive, onClick }: YearButtonProps) {
  return (
    <styled.button
      px="space.03"
      py="space.02"
      textStyle="label.02"
      color={isActive ? 'ink.background-primary' : 'ink.text-subdued'}
      bg={isActive ? 'ink.text-primary' : 'transparent'}
      borderWidth="1px"
      borderStyle="solid"
      borderColor={isActive ? 'ink.text-primary' : 'ink.border-default'}
      borderRadius="sm"
      cursor="pointer"
      transition="all 0.2s ease"
      _hover={
        isActive
          ? { bg: 'ink.text-primary', color: 'ink.background-primary' }
          : { bg: 'ink.component-background-hover', color: 'ink.text-primary' }
      }
      onClick={onClick}
    >
      {year}
    </styled.button>
  );
}

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick(): void;
}

function FilterButton({ label, isActive, onClick }: FilterButtonProps) {
  return (
    <styled.button
      px="space.03"
      py="space.02"
      textStyle="label.02"
      color={isActive ? 'ink.text-primary' : 'ink.text-subdued'}
      bg={isActive ? 'ink.component-background-hover' : 'transparent'}
      borderWidth="1px"
      borderStyle="solid"
      borderColor={isActive ? 'ink.text-primary' : 'ink.border-default'}
      borderRadius="sm"
      cursor="pointer"
      transition="all 0.2s ease"
      textTransform="capitalize"
      _hover={{ bg: 'ink.component-background-hover' }}
      onClick={onClick}
    >
      {label}
    </styled.button>
  );
}

interface TimelineMarkerProps {
  status: ProjectStatus;
}

function TimelineMarker({ status }: TimelineMarkerProps) {
  return (
    <styled.div
      position="absolute"
      left="-32px"
      top="50%"
      transform="translateY(-50%)"
      width="8px"
      height="100%"
      borderRadius="2px"
      zIndex={1}
      style={{ background: statusColor[status] }}
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
  project: RoadmapProject;
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <styled.div position="relative" mb="space.07" _last={{ mb: 0 }}>
      <TimelineMarker status={project.status} />
      <styled.div
        bg="ink.background-primary"
        borderWidth="1px"
        borderStyle="solid"
        borderColor="ink.border-default"
        borderRadius="sm"
        p="space.05"
        transition="all 0.2s ease"
        _hover={{
          borderColor: 'ink.text-subdued',
          boxShadow: '0 4px 12px rgba(18, 16, 15, 0.08)',
        }}
      >
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
      </styled.div>
    </styled.div>
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
      <FilterButton
        label="All Projects"
        isActive={activeFilter === 'all'}
        onClick={() => onFilterChange('all')}
      />
      {statuses.map(status => (
        <FilterButton
          key={status}
          label={statusLabel[status]}
          isActive={activeFilter === status}
          onClick={() => onFilterChange(status)}
        />
      ))}
    </Flex>
  );
}

interface RoadmapPageProps {
  years: RoadmapYearsQueryResult;
}

export function RoadmapPage({ years }: RoadmapPageProps) {
  const [activeYear, setActiveYear] = useState(years[0]?.year);
  const [activeFilter, setActiveFilter] = useState('all');

  const currentYearData = years.find(y => y.year === activeYear);
  if (!currentYearData) return null;

  const projects = currentYearData.projects ?? [];
  const objectives = currentYearData.objectives ?? [];

  const uniqueStatuses = [...new Set(projects.map(p => p.status))];
  const filteredProjects =
    activeFilter === 'all' ? projects : projects.filter(p => p.status === activeFilter);

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
            {years.map(yearData => (
              <YearButton
                key={yearData.year}
                year={yearData.year}
                isActive={yearData.year === activeYear}
                onClick={() => handleYearChange(yearData.year)}
              />
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

        {objectives.length > 0 && <ObjectivesSection objectives={objectives} />}

        <StatusFilter
          activeFilter={activeFilter}
          statuses={uniqueStatuses}
          onFilterChange={setActiveFilter}
        />

        <styled.div
          position="relative"
          pl="space.06"
          _before={{
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '2px',
            bg: 'ink.border-default',
          }}
        >
          {filteredProjects.map(project => (
            <ProjectCard key={project._key} project={project} />
          ))}

          {filteredProjects.length === 0 && (
            <styled.div
              bg="ink.background-primary"
              borderWidth="1px"
              borderStyle="solid"
              borderColor="ink.border-default"
              borderRadius="sm"
              p="space.05"
            >
              <styled.p textStyle="body.01" color="ink.text-subdued" textAlign="center">
                No projects match this filter.
              </styled.p>
            </styled.div>
          )}
        </styled.div>
      </Box>
    </Page>
  );
}
