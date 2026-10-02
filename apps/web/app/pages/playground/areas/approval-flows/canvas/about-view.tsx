import { type ReactNode, useEffect } from 'react';

import { css } from 'leather-styles/css';
import { Box, Flex, Grid, Stack, styled } from 'leather-styles/jsx';

import { Badge } from '@leather.io/ui';

import {
  type AboutComparison,
  aboutAccountMoments,
  aboutAgreed,
  aboutAhead,
  aboutAnatomyNote,
  aboutAnchorId,
  aboutAsks,
  aboutBorrowed,
  aboutBuiltInCode,
  aboutDecisionGroups,
  aboutDirectionNotes,
  aboutDirectionsLede,
  aboutGuaranteeModes,
  aboutHowToUse,
  aboutInShort,
  aboutIntro,
  aboutMeasurementLede,
  aboutPrinciples,
  aboutProblemFacts,
  aboutProblemLede,
  aboutProblemReadsWrong,
  aboutProblemTrace,
  aboutQuestions,
  aboutRuleGroups,
  aboutSections,
  aboutSourceGroups,
  aboutSteps,
  aboutStepsLede,
  aboutTodayScreens,
  principleAnchorId,
} from '../approval-flows.about';
import { type Decision, decisions } from '../approval-flows.content';
import { approvalEventSpecs } from '../approval-flows.events';
import { approvalIssues, githubIssueUrl } from '../approval-flows.issues';
import { approvalDirections } from '../directions/direction-registry';
import { approvalSurface } from '../pattern/approval-surface';
import { AboutAnatomy } from './about-anatomy';
import { useAboutNavigation, useAboutSectionObserver } from './about-navigation';
import { useCanvasNavigation } from './canvas-navigation';
import { useCanvasSettings } from './canvas-settings';
import { IssuesOverview, statusSummary } from './issues-panel';
import { Kbd } from './kbd';
import { ScaledCapture, popupWidth } from './scaled-frame';
import type { CanvasScreenSection } from './screen-sections';
import { ThumbCard } from './thumb-card';
import { EventSpec } from './viewer-measurement';

const textColumnWidth = '720px';
const wideColumnWidth = '1040px';
const captureScale = 0.26;
const everyScreenId = 'pattern';

const flashableCard = css({
  transition: 'outline-color 200ms ease',
  outline: '2px solid transparent',
  outlineOffset: '4px',
  '&[data-canvas-flash]': { outlineColor: 'ink.action-primary-default' },
});

const disclosure = css({
  '& > summary': { listStyle: 'none' },
  '& > summary::-webkit-details-marker': { display: 'none' },
  '& [data-chevron]': { transition: 'transform 160ms ease' },
  '&[open] [data-chevron]': { transform: 'rotate(90deg)' },
});

function useScreenLabels() {
  const { groups } = useCanvasNavigation();
  return new Map(groups.flatMap(group => group.items).map(item => [item.id, item.label]));
}

interface ScreenChipsProps {
  ids: string[];
  origin: string;
}

function ScreenChips({ ids, origin }: ScreenChipsProps) {
  const { openViewer } = useCanvasNavigation();
  const labels = useScreenLabels();
  const known = ids.filter(id => labels.has(id));
  if (known.length === 0) return null;
  return (
    <Flex gap="space.02" flexWrap="wrap" alignItems="center">
      {known.map(id => (
        <ScreenChip
          key={id}
          label={labels.get(id) ?? id}
          title="Open this screen in the viewer"
          onOpen={() => openViewer(id, undefined, origin)}
        />
      ))}
    </Flex>
  );
}

interface ScreenChipProps {
  label: string;
  title: string;
  isDashed?: boolean;
  onOpen(): void;
}

function ScreenChip({ label, title, isDashed = false, onOpen }: ScreenChipProps) {
  return (
    <styled.button
      type="button"
      title={title}
      onClick={onOpen}
      display="inline-flex"
      alignItems="center"
      gap="space.01"
      maxWidth="100%"
      textAlign="left"
      textStyle="caption.01"
      color="ink.text-primary"
      px="space.02"
      py="2px"
      borderWidth={1}
      borderStyle={isDashed ? 'dashed' : 'solid'}
      borderColor="ink.border-default"
      borderRadius="round"
      bg="ink.background-primary"
      cursor="pointer"
      _hover={{ borderColor: 'ink.text-primary' }}
    >
      <styled.span truncate>{label}</styled.span>
      <styled.span aria-hidden color="ink.text-subdued">
        →
      </styled.span>
    </styled.button>
  );
}

interface ExternalLinkProps {
  href: string;
  children: ReactNode;
}

function ExternalLink({ href, children }: ExternalLinkProps) {
  return (
    <styled.a
      href={href}
      target="_blank"
      rel="noreferrer"
      textStyle="caption.01"
      color="ink.text-primary"
      textDecoration="underline"
      textDecorationColor="ink.border-default"
      textUnderlineOffset="3px"
      _hover={{ textDecorationColor: 'ink.text-primary' }}
    >
      {children} ↗
    </styled.a>
  );
}

interface BulletListProps {
  items: string[];
  isSubdued?: boolean;
}

function BulletList({ items, isSubdued = false }: BulletListProps) {
  return (
    <Stack as="ul" gap="space.02">
      {items.map(item => (
        <Flex as="li" key={item} gap="space.03" alignItems="flex-start">
          <Box
            aria-hidden
            flexShrink={0}
            mt="9px"
            width="5px"
            height="5px"
            borderRadius="round"
            bg={isSubdued ? 'ink.text-subdued' : 'ink.text-primary'}
          />
          <styled.span
            textStyle="body.02"
            color={isSubdued ? 'ink.text-subdued' : 'ink.text-primary'}
          >
            {item}
          </styled.span>
        </Flex>
      ))}
    </Stack>
  );
}

interface SubheadingProps {
  children: ReactNode;
}

function Subheading({ children }: SubheadingProps) {
  return (
    <styled.h3 textStyle="label.01" color="ink.text-primary">
      {children}
    </styled.h3>
  );
}

interface AboutSectionBlockProps {
  id: string;
  lede?: string;
  isWide?: boolean;
  children: ReactNode;
}

function AboutSectionBlock({ id, lede, isWide = false, children }: AboutSectionBlockProps) {
  const index = aboutSections.findIndex(section => section.id === id);
  const section = aboutSections[index];
  if (!section) return null;
  const headingId = `${aboutAnchorId(id)}-heading`;
  return (
    <Box
      as="section"
      id={aboutAnchorId(id)}
      aria-labelledby={headingId}
      pt="space.08"
      pb="space.04"
      borderTopWidth={1}
      borderColor="ink.border-default"
    >
      <Stack gap="space.05" maxWidth={isWide ? wideColumnWidth : textColumnWidth}>
        <Stack gap="space.02" maxWidth={textColumnWidth}>
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            {String(index + 1).padStart(2, '0')}
          </styled.span>
          <styled.h2 id={headingId} textStyle="heading.04" color="ink.text-primary">
            {section.label}
          </styled.h2>
          {lede && (
            <styled.p textStyle="body.01" color="ink.text-primary">
              {lede}
            </styled.p>
          )}
        </Stack>
        {children}
      </Stack>
    </Box>
  );
}

function InShortSection() {
  return (
    <Box
      as="section"
      id={aboutAnchorId('in-short')}
      aria-labelledby="about-title"
      pt="space.07"
      pb="space.07"
    >
      <Stack gap="space.06" maxWidth={textColumnWidth}>
        <Stack gap="space.03">
          <styled.span textStyle="label.03" color="ink.text-subdued">
            {aboutIntro.eyebrow}
          </styled.span>
          <styled.h1 id="about-title" textStyle="heading.03" color="ink.text-primary">
            {aboutIntro.title}
          </styled.h1>
          <styled.p textStyle="body.01" color="ink.text-primary">
            {aboutIntro.lede}
          </styled.p>
        </Stack>
        <Stack gap="space.03">
          <Subheading>In short</Subheading>
          <BulletList items={aboutInShort} />
        </Stack>
        <Stack gap="space.03" p="space.05" className={approvalSurface.group}>
          <Subheading>What this asks for</Subheading>
          <BulletList items={aboutAsks} />
        </Stack>
        <Stack gap="space.03">
          <Subheading>Already agreed</Subheading>
          <BulletList items={aboutAgreed} isSubdued />
        </Stack>
        <Stack gap="space.03">
          <Subheading>How to read this playground</Subheading>
          <BulletList items={aboutHowToUse} isSubdued />
          <styled.p textStyle="caption.01" color="ink.text-subdued">
            {aboutBuiltInCode}
          </styled.p>
        </Stack>
      </Stack>
    </Box>
  );
}

interface ProblemSectionProps {
  sections: CanvasScreenSection[];
}

function ProblemSection({ sections }: ProblemSectionProps) {
  const { openViewer } = useCanvasNavigation();
  const labels = useScreenLabels();
  const captureIds = new Map(
    sections
      .flatMap(section => section.scenarios)
      .map(scenario => [scenario.id, scenario.captureId])
  );
  const origin = aboutAnchorId('problem');
  const width = Math.round(popupWidth * captureScale);
  return (
    <AboutSectionBlock id="problem" lede={aboutProblemLede}>
      <Grid
        gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
        columnGap="space.06"
        rowGap="space.05"
      >
        {aboutProblemFacts.map(fact => (
          <Stack
            key={fact.label}
            gap="space.01"
            borderTopWidth={1}
            borderColor="ink.border-default"
            pt="space.04"
          >
            <styled.span textStyle="heading.04">{fact.figure}</styled.span>
            <styled.span textStyle="label.02">{fact.label}</styled.span>
            <styled.p textStyle="caption.01" color="ink.text-subdued">
              {fact.detail}
            </styled.p>
          </Stack>
        ))}
      </Grid>
      <Stack gap="space.03">
        <Subheading>What reads wrong today</Subheading>
        <BulletList items={aboutProblemReadsWrong} />
      </Stack>
      <styled.p textStyle="body.02" p="space.04" className={approvalSurface.inset}>
        {aboutProblemTrace}
      </styled.p>
      <Stack gap="space.03">
        <Subheading>Today’s screens</Subheading>
        <styled.p textStyle="caption.01" color="ink.text-subdued">
          Real captures of the extension. Each opens in the viewer next to the proposal.
        </styled.p>
        <Flex gap="space.04" rowGap="space.05" flexWrap="wrap">
          {aboutTodayScreens
            .filter(id => labels.has(id))
            .map(id => (
              <ThumbCard
                key={id}
                width={width}
                label={labels.get(id)}
                title={labels.get(id)}
                actionLabel={`Open ${labels.get(id) ?? id} in the viewer, with today’s capture`}
                onOpen={() => openViewer(id, { showToday: true }, origin)}
              >
                <ScaledCapture captureId={captureIds.get(id)} scale={captureScale} />
              </ThumbCard>
            ))}
        </Flex>
      </Stack>
    </AboutSectionBlock>
  );
}

interface PatternSectionProps {
  sections: CanvasScreenSection[];
}

function PatternSection({ sections }: PatternSectionProps) {
  const scenarios = sections.flatMap(section => section.scenarios);
  return (
    <AboutSectionBlock id="pattern" lede={aboutAnatomyNote} isWide>
      <AboutAnatomy scenarios={scenarios} />
    </AboutSectionBlock>
  );
}

function RulesSection() {
  const origin = aboutAnchorId('rules');
  return (
    <AboutSectionBlock
      id="rules"
      lede="The same rules hold on every screen, whichever direction draws it."
    >
      <Stack gap="space.03">
        <Subheading>What moves, said as a guarantee</Subheading>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          The guarantee line starts with its mode, so the one word tells you how far the limits go.
        </styled.p>
        <Stack gap="0" borderTopWidth={1} borderColor="ink.border-default">
          {aboutGuaranteeModes.map(mode => (
            <Grid
              key={mode.label}
              gridTemplateColumns={{ base: '1fr', md: '150px 1fr' }}
              columnGap="space.04"
              rowGap="space.02"
              py="space.03"
              borderBottomWidth={1}
              borderColor="ink.border-default"
              alignItems="baseline"
            >
              <styled.span textStyle="label.02">{mode.label}</styled.span>
              <Flex
                gap="space.03"
                rowGap="space.02"
                flexWrap="wrap"
                alignItems="baseline"
                justifyContent="space-between"
              >
                <styled.span textStyle="body.02" color="ink.text-subdued" flex="1" minWidth="220px">
                  {mode.meaning}
                </styled.span>
                <ScreenChips ids={[mode.screen]} origin={origin} />
              </Flex>
            </Grid>
          ))}
        </Stack>
      </Stack>
      <Stack gap="space.03">
        <Subheading>Accounts and networks</Subheading>
        <styled.p textStyle="body.02" color="ink.text-subdued">
          Choosing an account happens once, when connecting. Every moment after that uses the
          choice.
        </styled.p>
        <Stack gap="0" borderTopWidth={1} borderColor="ink.border-default">
          {aboutAccountMoments.map(moment => (
            <Stack
              key={moment.moment}
              gap="space.02"
              py="space.04"
              borderBottomWidth={1}
              borderColor="ink.border-default"
            >
              <Flex
                gap="space.03"
                alignItems="baseline"
                justifyContent="space-between"
                flexWrap="wrap"
              >
                <styled.span textStyle="label.02">{moment.moment}</styled.span>
                <ScreenChips ids={[moment.screen]} origin={origin} />
              </Flex>
              <Grid
                gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
                columnGap="space.05"
                rowGap="space.02"
              >
                <Stack gap="1px">
                  <styled.span textStyle="caption.02" color="ink.text-subdued">
                    Today
                  </styled.span>
                  <styled.p textStyle="body.02" color="ink.text-subdued">
                    {moment.today}
                  </styled.p>
                </Stack>
                <Stack gap="1px">
                  <styled.span textStyle="caption.02" color="ink.text-subdued">
                    Proposed
                  </styled.span>
                  <styled.p textStyle="body.02">{moment.proposed}</styled.p>
                </Stack>
              </Grid>
            </Stack>
          ))}
        </Stack>
      </Stack>
      {aboutRuleGroups.map(group => (
        <Stack key={group.id} gap="space.03">
          <Subheading>{group.title}</Subheading>
          <BulletList items={group.points} />
          <ScreenChips ids={group.screens} origin={origin} />
        </Stack>
      ))}
    </AboutSectionBlock>
  );
}

function PrinciplesSection() {
  const { jumpToSection } = useAboutNavigation();
  return (
    <AboutSectionBlock
      id="principles"
      lede="Each rule above comes from one of these. Every principle has public evidence behind it and screens that show it."
    >
      <Stack gap="space.04">
        {aboutPrinciples.map((principle, index) => {
          const anchorId = principleAnchorId(principle.id);
          const sectionId = principle.sectionId;
          const sectionLabel = aboutSections.find(section => section.id === sectionId)?.label;
          return (
            <Stack
              as="article"
              key={principle.id}
              id={anchorId}
              aria-labelledby={`${anchorId}-title`}
              gap="space.03"
              p="space.05"
              className={`${approvalSurface.outline} ${flashableCard}`}
            >
              <Flex gap="space.03" alignItems="baseline">
                <styled.span textStyle="label.03" color="ink.text-subdued" flexShrink={0}>
                  {String(index + 1).padStart(2, '0')}
                </styled.span>
                <styled.h3 id={`${anchorId}-title`} textStyle="label.01">
                  {principle.title}
                </styled.h3>
              </Flex>
              <styled.p textStyle="body.02" color="ink.text-primary">
                {principle.why}
              </styled.p>
              <Flex gap="space.03" rowGap="space.01" flexWrap="wrap">
                {principle.sources.map(source => (
                  <ExternalLink key={source.url} href={source.url}>
                    {source.label}
                  </ExternalLink>
                ))}
              </Flex>
              <ScreenChips ids={principle.screens} origin={anchorId} />
              {sectionId && sectionLabel && (
                <Flex>
                  <ScreenChip
                    label={`See ${sectionLabel}`}
                    title={`Go to ${sectionLabel} on this page`}
                    isDashed
                    onOpen={() => jumpToSection(sectionId)}
                  />
                </Flex>
              )}
            </Stack>
          );
        })}
      </Stack>
    </AboutSectionBlock>
  );
}

interface ComparisonListProps {
  items: AboutComparison[];
  origin: string;
}

function ComparisonList({ items, origin }: ComparisonListProps) {
  return (
    <Stack gap="0" borderTopWidth={1} borderColor="ink.border-default">
      {items.map(item => (
        <Stack
          key={item.title}
          gap="space.02"
          py="space.04"
          borderBottomWidth={1}
          borderColor="ink.border-default"
        >
          <styled.span textStyle="label.02">{item.title}</styled.span>
          <styled.p textStyle="body.02" color="ink.text-subdued">
            {item.detail}
          </styled.p>
          <ScreenChips ids={item.screens} origin={origin} />
        </Stack>
      ))}
    </Stack>
  );
}

function OthersSection() {
  const origin = aboutAnchorId('others');
  return (
    <AboutSectionBlock
      id="others"
      lede="A sweep of other wallets and payment sheets. What fits was borrowed; where Leather already does better, the pattern keeps it."
    >
      <Stack gap="space.03">
        <Subheading>Borrowed</Subheading>
        <ComparisonList items={aboutBorrowed} origin={origin} />
      </Stack>
      <Stack gap="space.03">
        <Subheading>Where Leather is ahead</Subheading>
        <ComparisonList items={aboutAhead} origin={origin} />
      </Stack>
    </AboutSectionBlock>
  );
}

function DirectionsSection() {
  const { direction, discardedDirections, update } = useCanvasSettings();
  const { setView } = useCanvasNavigation();
  function open(id: string) {
    update({ direction: id });
    setView('screens');
  }
  return (
    <AboutSectionBlock id="directions" lede={aboutDirectionsLede}>
      <Stack gap="0" borderTopWidth={1} borderColor="ink.border-default">
        {approvalDirections.map((item, index) => {
          const note = aboutDirectionNotes.find(entry => entry.directionId === item.id);
          const isDiscarded = discardedDirections.includes(item.id);
          return (
            <Flex
              key={item.id}
              gap="space.04"
              py="space.05"
              borderBottomWidth={1}
              borderColor="ink.border-default"
              alignItems="flex-start"
              opacity={isDiscarded ? 0.72 : 1}
            >
              <styled.span
                textStyle="heading.05"
                color="ink.text-subdued"
                width="28px"
                flexShrink={0}
              >
                {index + 1}
              </styled.span>
              <Stack gap="space.02" flex="1" minWidth="0">
                <Flex gap="space.02" alignItems="center" flexWrap="wrap">
                  <styled.h3 textStyle="label.01">{item.name}</styled.h3>
                  {isDiscarded && (
                    <styled.span
                      textStyle="caption.02"
                      color="ink.text-subdued"
                      px="space.02"
                      borderWidth={1}
                      borderStyle="dashed"
                      borderColor="ink.border-default"
                      borderRadius="round"
                    >
                      Discarded
                    </styled.span>
                  )}
                  {item.id === direction && <Badge label="Selected" variant="default" />}
                </Flex>
                <styled.p textStyle="body.02">{item.description}</styled.p>
                {note && (
                  <styled.p textStyle="body.02" color="ink.text-subdued">
                    {note.borrowed}
                  </styled.p>
                )}
                <Flex gap="space.03" rowGap="space.01" flexWrap="wrap" alignItems="baseline">
                  <styled.span textStyle="caption.01" color="ink.text-subdued">
                    Inspired by {item.inspiration}
                  </styled.span>
                  {note?.sources.map(source => (
                    <ExternalLink key={source.url} href={source.url}>
                      {source.label}
                    </ExternalLink>
                  ))}
                </Flex>
                <Flex pt="space.01">
                  <ScreenChip
                    label="See it in Screens"
                    title={`Show every screen in ${item.name}`}
                    onOpen={() => open(item.id)}
                  />
                </Flex>
              </Stack>
            </Flex>
          );
        })}
      </Stack>
    </AboutSectionBlock>
  );
}

function recommendedLabel(decision: Decision) {
  return decision.options.find(option => option.recommended)?.label;
}

interface DecisionRowProps {
  decision: Decision;
}

function DecisionRow({ decision }: DecisionRowProps) {
  const { openViewer } = useCanvasNavigation();
  const { jumpToSection } = useAboutNavigation();
  const labels = useScreenLabels();
  const recommended = recommendedLabel(decision);
  const target = decision.seeAlso;
  return (
    <Flex
      as="li"
      gap="space.04"
      rowGap="space.02"
      py="space.03"
      borderBottomWidth={1}
      borderColor="ink.border-default"
      alignItems="flex-start"
      justifyContent="space-between"
      flexWrap="wrap"
    >
      <Stack gap="2px" flex="1" minWidth="260px">
        <styled.span textStyle="label.03">{decision.question}</styled.span>
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {recommended ? `Recommended: ${recommended}` : 'No recommendation yet'}
        </styled.span>
      </Stack>
      {target && target !== everyScreenId && labels.has(target) ? (
        <ScreenChip
          label={labels.get(target) ?? target}
          title="Open the screen that carries this decision, with its options and reasoning"
          onOpen={() => openViewer(target, undefined, aboutAnchorId('decisions'))}
        />
      ) : (
        <ScreenChip
          label="Every screen"
          title="Applies to the whole pattern"
          isDashed
          onOpen={() => jumpToSection('pattern')}
        />
      )}
    </Flex>
  );
}

function DecisionsSection() {
  const grouped = aboutDecisionGroups.flatMap(group => group.decisionIds);
  const others = decisions.filter(decision => !grouped.includes(decision.id));
  const groups = [
    ...aboutDecisionGroups.map(group => ({
      label: group.label,
      items: decisions.filter(decision => group.decisionIds.includes(decision.id)),
    })),
    { label: 'Other', items: others },
  ].filter(group => group.items.length > 0);
  const recommendedCount = decisions.filter(decision => recommendedLabel(decision)).length;
  return (
    <AboutSectionBlock
      id="decisions"
      lede="Open calls, almost all with a recommendation. The full options and reasoning sit in the viewer, next to the screen that shows them."
    >
      <Flex gap="space.06" rowGap="space.03" flexWrap="wrap">
        <Stack gap="0">
          <styled.span textStyle="heading.04">{decisions.length}</styled.span>
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            open decisions
          </styled.span>
        </Stack>
        <Stack gap="0">
          <styled.span textStyle="heading.04">{recommendedCount}</styled.span>
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            with a recommendation
          </styled.span>
        </Stack>
        <Stack gap="0">
          <styled.span textStyle="heading.04">{groups.length}</styled.span>
          <styled.span textStyle="caption.01" color="ink.text-subdued">
            groups
          </styled.span>
        </Stack>
      </Flex>
      {groups.map(group => (
        <Stack key={group.label} gap="space.02">
          <Flex gap="space.02" alignItems="baseline">
            <Subheading>{group.label}</Subheading>
            <styled.span textStyle="caption.02" color="ink.text-subdued">
              {group.items.length}
            </styled.span>
          </Flex>
          <Stack as="ul" gap="0" borderTopWidth={1} borderColor="ink.border-default">
            {group.items.map(decision => (
              <DecisionRow key={decision.id} decision={decision} />
            ))}
          </Stack>
        </Stack>
      ))}
    </AboutSectionBlock>
  );
}

interface IssuesSectionProps {
  sections: CanvasScreenSection[];
}

function IssuesSection({ sections }: IssuesSectionProps) {
  const { openViewer, setIssuesOpen } = useCanvasNavigation();
  return (
    <AboutSectionBlock
      id="issues"
      lede="The GitHub issues this proposal answers, and how far each one is covered by a screen or a decision."
    >
      <Flex gap="space.04" rowGap="space.02" alignItems="center" flexWrap="wrap">
        <styled.span textStyle="label.02">
          {approvalIssues.length} open issues · {statusSummary()}
        </styled.span>
        <styled.button
          type="button"
          data-issues-trigger
          onClick={() => setIssuesOpen(true)}
          display="flex"
          alignItems="center"
          gap="space.02"
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
          Open the issues panel <Kbd>i</Kbd>
        </styled.button>
      </Flex>
      <styled.details
        className={disclosure}
        borderWidth={1}
        borderColor="ink.border-default"
        borderRadius="md"
      >
        <styled.summary
          display="flex"
          alignItems="center"
          gap="space.02"
          px="space.04"
          py="space.03"
          cursor="pointer"
          textStyle="label.02"
          _hover={{ bg: 'ink.component-background-hover' }}
        >
          <styled.span data-chevron aria-hidden color="ink.text-subdued">
            ›
          </styled.span>
          Every issue, by status
        </styled.summary>
        <Stack gap="space.05" px="space.04" pb="space.05" pt="space.02">
          <IssuesOverview
            sections={sections}
            onJump={id => openViewer(id, undefined, aboutAnchorId('issues'))}
          />
        </Stack>
      </styled.details>
    </AboutSectionBlock>
  );
}

function MeasurementSection() {
  return (
    <AboutSectionBlock id="measurement" lede={aboutMeasurementLede}>
      <Flex gap="space.02" flexWrap="wrap">
        {approvalEventSpecs.map(spec => (
          <styled.code
            key={spec.name}
            title={spec.when}
            textStyle="caption.01"
            px="space.02"
            py="2px"
            borderRadius="xs"
            className={approvalSurface.inset}
          >
            {spec.name}
          </styled.code>
        ))}
      </Flex>
      <styled.p textStyle="body.02" color="ink.text-subdued">
        In the viewer, each screen lists the events it sends with example values.
      </styled.p>
      <EventSpec />
    </AboutSectionBlock>
  );
}

function RollOutSection() {
  return (
    <AboutSectionBlock id="roll-out" lede={aboutStepsLede}>
      <Stack as="ol" gap="0" borderTopWidth={1} borderColor="ink.border-default">
        {aboutSteps.map((step, index) => (
          <Flex
            as="li"
            key={step.title}
            gap="space.04"
            py="space.04"
            borderBottomWidth={1}
            borderColor="ink.border-default"
            alignItems="flex-start"
          >
            <styled.span
              textStyle="heading.05"
              color="ink.text-subdued"
              width="28px"
              flexShrink={0}
            >
              {index + 1}
            </styled.span>
            <Stack gap="space.01" flex="1" minWidth="0">
              <styled.span textStyle="label.02">{step.title}</styled.span>
              <styled.p textStyle="body.02" color="ink.text-subdued">
                {step.detail}
              </styled.p>
              <Flex gap="space.03" flexWrap="wrap">
                {step.issues.map(number => (
                  <ExternalLink key={number} href={githubIssueUrl(number)}>
                    #{number}
                  </ExternalLink>
                ))}
              </Flex>
            </Stack>
          </Flex>
        ))}
      </Stack>
    </AboutSectionBlock>
  );
}

function QuestionsSection() {
  const origin = aboutAnchorId('open-questions');
  return (
    <AboutSectionBlock
      id="open-questions"
      lede="What engineering needs to answer before these screens can be built as drawn."
    >
      <Stack as="ul" gap="0" borderTopWidth={1} borderColor="ink.border-default">
        {aboutQuestions.map(item => (
          <Stack
            as="li"
            key={item.question}
            gap="space.02"
            py="space.04"
            borderBottomWidth={1}
            borderColor="ink.border-default"
          >
            <styled.span textStyle="label.02">{item.question}</styled.span>
            <styled.p textStyle="body.02" color="ink.text-subdued">
              {item.detail}
            </styled.p>
            <ScreenChips ids={item.screens} origin={origin} />
          </Stack>
        ))}
      </Stack>
    </AboutSectionBlock>
  );
}

function SourcesSection() {
  return (
    <AboutSectionBlock id="sources" lede="Public sources only.">
      <Grid
        gridTemplateColumns={{ base: '1fr', md: '1fr 1fr' }}
        columnGap="space.06"
        rowGap="space.06"
      >
        {aboutSourceGroups.map(group => (
          <Stack key={group.label} gap="space.03">
            <Subheading>{group.label}</Subheading>
            <Stack as="ul" gap="space.02">
              {group.links.map(link => (
                <styled.li key={link.url}>
                  <ExternalLink href={link.url}>{link.label}</ExternalLink>
                </styled.li>
              ))}
            </Stack>
          </Stack>
        ))}
      </Grid>
    </AboutSectionBlock>
  );
}

function useInitialAboutHash() {
  const { jumpToSection } = useAboutNavigation();
  const { scrollToAnchor } = useCanvasNavigation();
  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace('#', ''));
    if (!hash) return;
    const section = aboutSections.find(item => aboutAnchorId(item.id) === hash);
    if (section) jumpToSection(section.id);
    else if (hash.startsWith(principleAnchorId(''))) scrollToAnchor(hash);
  }, [jumpToSection, scrollToAnchor]);
}

interface AboutViewProps {
  sections: CanvasScreenSection[];
}

export function AboutView({ sections }: AboutViewProps) {
  useAboutSectionObserver();
  useInitialAboutHash();
  return (
    <Box pb="space.11">
      <InShortSection />
      <ProblemSection sections={sections} />
      <PatternSection sections={sections} />
      <RulesSection />
      <PrinciplesSection />
      <OthersSection />
      <DirectionsSection />
      <DecisionsSection />
      <IssuesSection sections={sections} />
      <MeasurementSection />
      <RollOutSection />
      <QuestionsSection />
      <SourcesSection />
    </Box>
  );
}
