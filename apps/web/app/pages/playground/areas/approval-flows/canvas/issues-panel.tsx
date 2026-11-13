import { useEffect, useRef } from 'react';

import { css } from 'leather-styles/css';
import { Flex, Stack, styled } from 'leather-styles/jsx';

import { decisions } from '../approval-flows.content';
import {
  type ApprovalIssue,
  type ApprovalIssueStatus,
  approvalIssues,
  githubIssueUrl,
  initiativeIssue,
  issueStatusDescriptions,
  issueStatusLabels,
  issueStatusOrder,
} from '../approval-flows.issues';
import type { Scenario } from '../scenarios/scenario';
import { useCanvasNavigation } from './canvas-navigation';
import { Kbd } from './kbd';
import type { CanvasScreenSection } from './screen-sections';

const issuesTriggerSelector = '[data-issues-trigger]';

const statusDotStyles: Record<ApprovalIssueStatus, string> = {
  addressed: css({ bg: 'green.action-primary-default' }),
  partial: css({ bg: 'yellow.action-primary-default' }),
  decision: css({ bg: 'ink.action-primary-default' }),
  'not-yet': css({ bg: 'red.action-primary-default' }),
  'out-of-scope': css({ borderWidth: 1, borderColor: 'ink.text-subdued' }),
};

function toRefNumber(ref: string) {
  return Number(ref.replace('#', ''));
}

function refNumbers(scenario: Scenario) {
  return (scenario.refs ?? []).map(toRefNumber);
}

interface LabelledItem {
  id: string;
  label: string;
}

function toLabelEntry({ id, label }: LabelledItem): [string, string] {
  return [id, label];
}

interface IssueStatusDotProps {
  status: ApprovalIssueStatus;
}

function IssueStatusDot({ status }: IssueStatusDotProps) {
  return (
    <styled.span
      aria-hidden
      className={statusDotStyles[status]}
      display="inline-block"
      flexShrink={0}
      width="8px"
      height="8px"
      borderRadius="round"
    />
  );
}

interface IssueStatusTagProps {
  status: ApprovalIssueStatus;
}

function IssueStatusTag({ status }: IssueStatusTagProps) {
  return (
    <Flex
      alignItems="center"
      gap="space.01"
      flexShrink={0}
      textStyle="caption.02"
      color="ink.text-subdued"
    >
      <IssueStatusDot status={status} />
      {issueStatusLabels[status]}
    </Flex>
  );
}

interface IssueTitleLinkProps {
  issue: ApprovalIssue;
}

function IssueTitleLink({ issue }: IssueTitleLinkProps) {
  return (
    <styled.a
      href={issue.url}
      target="_blank"
      rel="noreferrer"
      title={issue.title}
      textStyle="label.03"
      color="ink.text-primary"
      textDecoration="underline"
      textDecorationColor="ink.border-default"
      textUnderlineOffset="3px"
      _hover={{ textDecorationColor: 'ink.text-primary' }}
    >
      #{issue.number} {issue.short} ↗
    </styled.a>
  );
}

interface ViewerIssuesProps {
  scenario: Scenario;
}

export function ViewerIssues({ scenario }: ViewerIssuesProps) {
  const { setIssuesOpen } = useCanvasNavigation();
  const numbers = refNumbers(scenario);
  const addressed = approvalIssues.filter(
    issue => issue.screens.includes(scenario.id) || numbers.includes(issue.number)
  );
  const addressedNumbers = addressed.map(issue => issue.number);
  const related = numbers.filter(
    number => !addressedNumbers.includes(number) && number !== initiativeIssue.number
  );
  if (addressed.length === 0 && related.length === 0) return null;
  return (
    <Stack as="section" aria-label="Issues this screen addresses" gap="space.03">
      <Flex alignItems="baseline" justifyContent="space-between">
        <styled.span textStyle="label.03">Addresses</styled.span>
        <styled.button
          type="button"
          data-issues-trigger
          onClick={() => setIssuesOpen(true)}
          textStyle="caption.02"
          color="ink.text-subdued"
          textDecoration="underline"
          textUnderlineOffset="2px"
          cursor="pointer"
          _hover={{ color: 'ink.text-primary' }}
        >
          All issues
        </styled.button>
      </Flex>
      {addressed.map(issue => (
        <Stack key={issue.number} gap="space.01">
          <Flex alignItems="baseline" justifyContent="space-between" gap="space.02">
            <IssueTitleLink issue={issue} />
            <IssueStatusTag status={issue.status} />
          </Flex>
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            {issue.how}
          </styled.p>
        </Stack>
      ))}
      {related.length > 0 && (
        <Flex gap="space.02" flexWrap="wrap" alignItems="baseline">
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            Also related
          </styled.span>
          {related.map(number => (
            <styled.a
              key={number}
              href={githubIssueUrl(number)}
              target="_blank"
              rel="noreferrer"
              textStyle="caption.02"
              color="ink.text-subdued"
              textDecoration="underline"
              textUnderlineOffset="2px"
            >
              #{number}
            </styled.a>
          ))}
        </Flex>
      )}
    </Stack>
  );
}

interface JumpChipProps {
  label: string;
  title?: string;
  isDecision?: boolean;
  onJump?(): void;
}

function JumpChip({ label, title, isDecision = false, onJump }: JumpChipProps) {
  const color = isDecision ? 'ink.text-subdued' : 'ink.text-primary';
  if (!onJump) {
    return (
      <styled.span
        title={title}
        textStyle="caption.02"
        color={color}
        px="space.02"
        py="2px"
        borderWidth={1}
        borderStyle="dashed"
        borderColor="ink.border-default"
        borderRadius="round"
      >
        {label}
      </styled.span>
    );
  }
  return (
    <styled.button
      type="button"
      title={title}
      onClick={onJump}
      textAlign="left"
      textStyle="caption.02"
      color={color}
      px="space.02"
      py="2px"
      borderWidth={1}
      borderStyle={isDecision ? 'dashed' : 'solid'}
      borderColor="ink.border-default"
      borderRadius="round"
      bg="ink.background-primary"
      cursor="pointer"
      _hover={{ borderColor: 'ink.text-primary', color: 'ink.text-primary' }}
    >
      {label}
    </styled.button>
  );
}

interface IssueItemProps {
  issue: ApprovalIssue;
  labels: Map<string, string>;
  extraCount: number;
  onJump(id: string): void;
}

function IssueItem({ issue, labels, extraCount, onJump }: IssueItemProps) {
  const issueDecisions = decisions.filter(decision => issue.decisions?.includes(decision.id));
  return (
    <Stack
      as="article"
      gap="space.02"
      pt="space.03"
      borderTopWidth={1}
      borderColor="ink.border-default"
    >
      <Stack gap="1px">
        <IssueTitleLink issue={issue} />
        {issue.link === 'unlinked' && (
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            Not a sub-issue of #{initiativeIssue.number} yet
          </styled.span>
        )}
      </Stack>
      <styled.p textStyle="caption.01" color="ink.text-primary">
        {issue.how}
      </styled.p>
      {issue.asks && (
        <Stack as="ul" gap="2px">
          {issue.asks.map(ask => (
            <Flex as="li" key={ask.ask} gap="space.02" alignItems="baseline">
              <IssueStatusDot status={ask.status} />
              <styled.span textStyle="caption.02" color="ink.text-primary">
                {ask.ask}
                <styled.span color="ink.text-subdued">
                  {' '}
                  · {issueStatusLabels[ask.status]}
                </styled.span>
              </styled.span>
            </Flex>
          ))}
        </Stack>
      )}
      {issue.gap && (
        <styled.p textStyle="caption.02" color="ink.text-subdued">
          Not shown: {issue.gap}
        </styled.p>
      )}
      <Flex gap="space.01" flexWrap="wrap">
        {issue.screens.map(id => (
          <JumpChip
            key={id}
            label={labels.get(id) ?? id}
            title="Open this screen in the viewer"
            onJump={labels.has(id) ? () => onJump(id) : undefined}
          />
        ))}
        {issueDecisions.map(decision => {
          const target = decision.seeAlso;
          return (
            <JumpChip
              key={decision.id}
              label={`Decision: ${decision.question}`}
              title="Open the screen that carries this decision"
              isDecision
              onJump={target && labels.has(target) ? () => onJump(target) : undefined}
            />
          );
        })}
      </Flex>
      {extraCount > 0 && (
        <styled.span textStyle="caption.02" color="ink.text-subdued">
          Also referenced on {extraCount} more {extraCount === 1 ? 'screen' : 'screens'}
        </styled.span>
      )}
    </Stack>
  );
}

export function statusSummary() {
  return issueStatusOrder
    .map(status => ({
      status,
      count: approvalIssues.filter(issue => issue.status === status).length,
    }))
    .filter(item => item.count > 0)
    .map(item => `${item.count} ${issueStatusLabels[item.status].toLowerCase()}`)
    .join(' · ');
}

interface IssuesOverviewProps {
  sections: CanvasScreenSection[];
  onJump(id: string): void;
}

export function IssuesOverview({ sections, onJump }: IssuesOverviewProps) {
  const { groups } = useCanvasNavigation();
  const labels = new Map(groups.flatMap(group => group.items).map(toLabelEntry));
  const scenarios = sections.flatMap(section => section.scenarios);

  function extraCount(issue: ApprovalIssue) {
    return scenarios.filter(
      scenario =>
        !issue.screens.includes(scenario.id) && refNumbers(scenario).includes(issue.number)
    ).length;
  }

  const statusGroups = issueStatusOrder
    .map(status => ({ status, items: approvalIssues.filter(issue => issue.status === status) }))
    .filter(group => group.items.length > 0);

  return (
    <>
      <Stack gap="space.02">
        <Flex alignItems="baseline" justifyContent="space-between" gap="space.02">
          <styled.span textStyle="label.03">Initiative</styled.span>
          <IssueStatusTag status={initiativeIssue.status} />
        </Flex>
        <IssueItem issue={initiativeIssue} labels={labels} extraCount={0} onJump={onJump} />
      </Stack>
      {statusGroups.map(group => (
        <Stack key={group.status} gap="space.02">
          <Stack gap="1px">
            <Flex alignItems="center" gap="space.02">
              <IssueStatusDot status={group.status} />
              <styled.span textStyle="label.03">{issueStatusLabels[group.status]}</styled.span>
              <styled.span textStyle="caption.02" color="ink.text-subdued">
                {group.items.length}
              </styled.span>
            </Flex>
            <styled.span textStyle="caption.02" color="ink.text-subdued">
              {issueStatusDescriptions[group.status]}
            </styled.span>
          </Stack>
          {group.items.map(issue => (
            <IssueItem
              key={issue.number}
              issue={issue}
              labels={labels}
              extraCount={extraCount(issue)}
              onJump={onJump}
            />
          ))}
        </Stack>
      ))}
    </>
  );
}

interface IssuesPanelProps {
  sections: CanvasScreenSection[];
}

export function IssuesPanel({ sections }: IssuesPanelProps) {
  const { isIssuesOpen, setIssuesOpen, openViewer } = useCanvasNavigation();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isIssuesOpen) return;
    const previous = document.activeElement;
    panelRef.current?.focus();
    function onPointerDown(event: PointerEvent) {
      const panel = panelRef.current;
      const target = event.target;
      if (!panel || !(target instanceof Element)) return;
      if (panel.contains(target) || target.closest(issuesTriggerSelector)) return;
      setIssuesOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      setIssuesOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, [isIssuesOpen, setIssuesOpen]);

  if (!isIssuesOpen) return null;

  function jump(id: string) {
    setIssuesOpen(false);
    openViewer(id);
  }

  return (
    <Stack
      ref={panelRef}
      role="dialog"
      aria-label="Issues this proposal addresses"
      tabIndex={-1}
      position="fixed"
      zIndex={40}
      left="space.04"
      right={{ base: 'space.04', lg: 'auto' }}
      width={{ base: 'auto', lg: '480px' }}
      top={{ base: 'calc(var(--canvas-toolbar-height, 0px) + 8px)', lg: '16px' }}
      bottom={{ base: 'auto', lg: '60px' }}
      maxHeight={{
        base: 'calc(100vh - var(--canvas-toolbar-height, 0px) - 24px)',
        lg: 'none',
      }}
      overflowY="auto"
      gap="space.05"
      p="space.04"
      bg="ink.background-primary"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="sm"
      boxShadow="0 12px 32px rgba(18, 16, 15, 0.14)"
      _focus={{ outline: 'none' }}
    >
      <Flex alignItems="flex-start" justifyContent="space-between" gap="space.03">
        <Stack gap="space.01">
          <styled.span textStyle="label.02" color="ink.text-primary">
            Issues
          </styled.span>
          <styled.span textStyle="caption.01" color="ink.text-primary">
            {approvalIssues.length} open issues · {statusSummary()}
          </styled.span>
        </Stack>
        <styled.button
          type="button"
          onClick={() => setIssuesOpen(false)}
          display="flex"
          alignItems="center"
          gap="space.02"
          flexShrink={0}
          textStyle="caption.01"
          color="ink.text-primary"
          px="space.02"
          py="2px"
          borderWidth={1}
          borderColor="ink.border-default"
          borderRadius="round"
          bg="ink.background-primary"
          cursor="pointer"
          _hover={{ borderColor: 'ink.text-primary' }}
        >
          Close <Kbd>Esc</Kbd>
        </styled.button>
      </Flex>
      <IssuesOverview sections={sections} onJump={jump} />
    </Stack>
  );
}
