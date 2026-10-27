// Today's real screenshots: the reference to judge each concept against.
// Steps and concept screens are matched by job, so in a comparison each real
// step reads as one of: "≈ concept <screen>", "Kept (unchanged)" (left as it
// is on purpose), "Cut · <why>" (removed on purpose), or "Not covered" (a
// silent drop to fix).
import { Box, Stack, styled } from 'leather-styles/jsx';

import { Pressable } from '@leather.io/ui';

import type { TodayConfig, TodayCut, TodayFlow, TodayKept, TodayStep } from './exploration-config';
import { type FrameId, type ThemeId, frameSizes } from './frame';
import { Thumb } from './lightbox';

// Today's popup captures are shown in a 360×600 box: the round-1 and round-2
// captures were taken at 360×600. A capture at the real popup size (390×600) is
// cover-fitted, which trims ~15px of side padding from each edge. Tab captures
// are 1280×800.
const capture = { popup: { width: 360, height: 600 }, tab: { width: 1280, height: 800 } };

// How the selected variant treats today's steps: which concept screens do each
// job, and which steps it cuts.
export interface TodayCoverage {
  // job → concept screen labels doing it
  screensByJob: Record<string, string[]>;
  cuts: TodayCut[];
  kept: TodayKept[];
}

function keptLine(why: string | undefined) {
  return why ? `Kept · ${why}` : 'Kept (unchanged)';
}

export function coverageLine(step: TodayStep, coverage: TodayCoverage) {
  const cut = coverage.cuts.find(item => item.step === step.name);
  if (cut) return `Cut · ${cut.why}`;
  const kept = coverage.kept.find(item => item.step === step.name);
  if (kept) return keptLine(kept.why);
  if (step.kept) return keptLine(step.kept === true ? undefined : step.kept);
  if (!step.jobs?.length) return ' ';
  const screens = step.jobs.flatMap(job => coverage.screensByJob[job] ?? []);
  if (screens.length === 0) return 'Not covered: say why';
  return `≈ concept ${screens.join(', ')}`;
}

function Placeholder({ width, height, text }: { width: number; height: number; text: string }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      px="space.03"
      style={{ width, height }}
      borderWidth={1}
      borderColor="ink.border-default"
      borderStyle="dashed"
      borderRadius="xs"
      bg="ink.background-secondary"
    >
      <styled.span textStyle="caption.01" color="ink.text-subdued">
        {text}
      </styled.span>
    </Box>
  );
}

// One real step drawn as a popup frame (390×600), so today's contact sheet
// reads exactly like a concept's. The 360×600 captures are contained, not
// cropped: the frame's background (the capture's own, in the same theme)
// fills the sides.
export function TodayFrame({
  today,
  step,
  theme,
}: {
  today: TodayConfig;
  step: TodayStep;
  theme: ThemeId;
}) {
  const size = frameSizes.popup;
  return (
    <Box
      className={theme === 'dark' ? 'dark' : undefined}
      data-frame="popup"
      data-theme={theme}
      data-today-step={step.name}
      style={{ width: size.width, height: size.height }}
      flexShrink={0}
      borderWidth={1}
      borderStyle="solid"
      borderColor="ink.border-default"
      bg="ink.background-primary"
      overflow="hidden"
    >
      {step.missing ? (
        <Placeholder width={size.width - 2} height={size.height - 2} text="Not captured" />
      ) : (
        <styled.img
          src={today.image(step.name, 'popup', theme)}
          alt={step.label}
          display="block"
          width="100%"
          height="100%"
          objectFit="contain"
          objectPosition="top"
        />
      )}
    </Box>
  );
}

// Tab captures are 1280×800; the rail shows them at a third.
const tabRailWidth = 420;
const tabRailHeight = Math.round((tabRailWidth * capture.tab.height) / capture.tab.width);

// The first step that does the job. `flowId` (a variant's `compareFlow`) puts
// that flow first, so a concept for one asset is compared with that asset's
// real form; the other flows still answer for jobs it doesn't have.
function findStep(today: TodayConfig, job: string, flowId?: string) {
  const flows = flowId
    ? [
        ...today.flows.filter(flow => flow.id === flowId),
        ...today.flows.filter(flow => flow.id !== flowId),
      ]
    : today.flows;
  for (const flow of flows) {
    const step = flow.steps.find(candidate => candidate.jobs?.includes(job) && !candidate.missing);
    if (step) return step;
  }
  return undefined;
}

interface TodayRailProps {
  today: TodayConfig;
  job: string;
  notInToday?: string;
  // The variant's `compareFlow`.
  flowId?: string | undefined;
  frame: FrameId;
  theme: ThemeId;
}

// Narrow rail next to the single screen: the real step that does the same job.
export function TodayRail({ today, job, notInToday, flowId, frame, theme }: TodayRailProps) {
  const step = findStep(today, job, flowId);
  const width = frame === 'popup' ? capture.popup.width : tabRailWidth;
  const height = frame === 'popup' ? capture.popup.height : tabRailHeight;
  const tabNote = frame === 'tab' && theme === 'dark' && today.tabLightOnly ? ' · light only' : '';
  const noCapture = step && frame === 'tab' && step.popupOnly;
  return (
    <Stack gap="space.03" flexShrink={0} style={{ width }}>
      <styled.span textStyle="caption.01" color="ink.text-secondary">
        {step ? `Today · actual · ${step.label}${tabNote}` : 'Today · actual · not in today’s flow'}
      </styled.span>
      {step && !noCapture ? (
        <Thumb
          src={today.image(step.name, frame, theme)}
          caption={`Today · actual · ${step.label}`}
          width={width}
          height={height}
        />
      ) : (
        <Placeholder
          width={width}
          height={height}
          text={noCapture ? 'Popup only' : (notInToday ?? 'No step does this job today.')}
        />
      )}
    </Stack>
  );
}

export interface NumberedStep {
  flow: TodayFlow;
  step: TodayStep;
  number: number;
}

// Every real step in order, numbered the way the flows number them.
export function todaySteps(today: TodayConfig): NumberedStep[] {
  return today.flows.flatMap(flow =>
    flow.steps.map((step, index) => ({ flow, step, number: flow.startAt + index }))
  );
}

interface TodayScreenProps {
  today: TodayConfig;
  entry: NumberedStep;
  frame: FrameId;
  theme: ThemeId;
  // Click-through: the screenshot itself advances to the next step.
  onNext?(): void;
  nextLabel?: string;
}

// One real step at full size, in place of a concept frame (Today · actual).
export function TodayScreen({ today, entry, frame, theme, onNext, nextLabel }: TodayScreenProps) {
  const { step } = entry;
  const tab = frame === 'tab' && !step.popupOnly;
  const width = tab ? capture.tab.width : capture.popup.width;
  const height = tab ? capture.tab.height : capture.popup.height;
  const src = step.missing ? '' : today.image(step.name, tab ? 'tab' : 'popup', theme);
  if (!src)
    return (
      <Placeholder
        width={width}
        height={height}
        text={step.missing ? 'Not captured' : 'No capture'}
      />
    );
  const image = (
    <styled.img
      src={src}
      alt={`Today · ${entry.flow.label} · ${entry.number} ${step.label}`}
      display="block"
      style={{ width, height }}
      objectFit="cover"
      objectPosition="top"
      borderWidth={1}
      borderStyle="solid"
      borderColor="ink.border-default"
      bg="ink.background-primary"
    />
  );
  if (!onNext) return image;
  return (
    <Pressable
      _before={{ display: 'none' }}
      type="button"
      onClick={onNext}
      width="auto"
      bg="transparent"
      title={nextLabel}
      aria-label={nextLabel}
      display="block"
      p="0"
      cursor="pointer"
      _focusVisible={{ outline: 'focus', outlineOffset: '2px' }}
    >
      {image}
    </Pressable>
  );
}
