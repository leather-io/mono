// The exploration canvas: two rails on the left, then the canvas.
// - navigation rail (navigator-rail.tsx): Today (one entry), the variants,
//   the selected one's screens in flow order, view / frame / theme, compare.
// - info rail (info-rail.tsx): the description, concept, notes & assumptions,
//   Inspiration, "How we got here".
// - canvas, in one of three views:
//   - All (the landing, no variant selected): every contact sheet
//     stacked, Today first. A heading opens that sheet, a frame that screen.
//   - Single: one screen, fitted whole above the dock. Hotspots click through
//     to the next screen; the Previous / Next buttons walk the flow order. With "Compare
//     with today", the real step that does the same job sits beside it.
//   - Contact sheet: every screen of the selection in one grid. Today's
//     screenshots use the same grid, frames and labels as a concept.
// An area renders <ExplorationCanvas config={…} /> and owns only its config,
// mocks and variants. Protocol: docs/design/explore.md.
import { type ComponentType, type ReactNode, useCallback, useEffect, useState } from 'react';

import { Box, Flex, Stack, styled } from 'leather-styles/jsx';

import { ChevronLeftIcon, ChevronRightIcon, Pressable } from '@leather.io/ui';

import { dockClearance } from '../../components/playground-dock';
import { ClickThrough } from './click-through';
import {
  type ExplorationConfig,
  type FlowTransition,
  type ScreenProps,
  compareFlowId,
  conceptIds,
  recreatedToday,
  screenJob,
  todayCuts,
  todayKept,
  variantFlow,
  variantTitle,
} from './exploration-config';
import { DeviceFrame, frameIds, frameLayout, frameSizeIds, frameSizes, themeIds } from './frame';
import { InfoRail } from './info-rail';
import { LightboxProvider } from './lightbox';
import { NavigatorRail, type ViewId, currentStep, currentView, isToday } from './navigator-rail';
import { Kbd, plainPressable, useRailOpen } from './rail';
import { ScaleToFit } from './scale-to-fit';
import { CanvasBoundary, ScreenBoundary } from './screen-boundary';
import {
  type TodayCoverage,
  TodayFrame,
  TodayRail,
  TodayScreen,
  coverageLine,
  todaySteps,
} from './today-flow';
import { type ExplorationParams, useExplorationParams } from './use-exploration-params';

interface CanvasProps<V extends string, S extends string> {
  config: ExplorationConfig<V, S>;
  params: ExplorationParams<V, S>;
}

// "Variant A · Recipient", for error messages. Falls back to the raw ids when
// the config itself is what's broken.
function viewLabel<V extends string, S extends string>(
  config: ExplorationConfig<V, S>,
  variant: V,
  screen?: S
) {
  const variantLabel = variant in config.variants ? config.variants[variant].label : variant;
  const parts = [`Variant ${variantLabel}`];
  if (screen) parts.push(screen in config.screens ? config.screens[screen].label : screen);
  return parts.join(' · ');
}

function FramedScreen<V extends string, S extends string>({
  config,
  params,
  screen,
  onNavigate,
}: CanvasProps<V, S> & { screen: S; onNavigate?(screen: string): void }) {
  const Screen: ComponentType<ScreenProps> = config.variants[params.variant].module.screens[screen];
  return (
    <DeviceFrame frame={params.frame} theme={params.theme} variant={params.variant} screen={screen}>
      <ScreenBoundary
        key={`${params.variant}-${screen}`}
        label={viewLabel(config, params.variant, screen)}
      >
        <Screen frame={frameLayout(params.frame)} theme={params.theme} onNavigate={onNavigate} />
      </ScreenBoundary>
    </DeviceFrame>
  );
}

function FrameLabel({ children }: { children: string }) {
  return (
    <styled.span textStyle="caption.01" color="ink.text-secondary">
      {children}
    </styled.span>
  );
}

function coverageFor<V extends string, S extends string>({ config, params }: CanvasProps<V, S>) {
  const screensByJob: Record<string, string[]> = {};
  for (const screen of config.screenIds) {
    const job = screenJob(config, params.variant, screen);
    screensByJob[job] = [...(screensByJob[job] ?? []), config.screens[screen].label];
  }
  const coverage: TodayCoverage = {
    screensByJob,
    cuts: todayCuts(config, params.variant),
    kept: todayKept(config, params.variant),
  };
  return coverage;
}

interface NavButtonProps {
  onClick?(): void;
  disabled?: boolean;
  label: string;
  shortcut: string;
  children: ReactNode;
}

// Icon-only round button: the accessible name carries the words.
function NavButton({ onClick, disabled, label, shortcut, children }: NavButtonProps) {
  return (
    <Pressable
      {...plainPressable}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={`${label} (${shortcut})`}
      width="32px"
      height="32px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexShrink={0}
      color="ink.text-primary"
      borderWidth={1}
      borderColor="ink.border-default"
      borderRadius="round"
      bg="ink.background-primary"
      cursor="pointer"
      _hover={{ bg: 'ink.component-background-hover' }}
      _disabled={{ opacity: 0.4, cursor: 'default', _hover: { bg: 'ink.background-primary' } }}
      _focusVisible={{ outline: 'focus', outlineOffset: '2px' }}
    >
      {children}
    </Pressable>
  );
}

// Previous / next in flow order, side by side at the top of the canvas.
function StepNav({ onPrevious, onNext }: { onPrevious?(): void; onNext?(): void }) {
  return (
    <Flex justifyContent="flex-end" gap="space.02" width="100%" flexShrink={0}>
      <NavButton onClick={onPrevious} disabled={!onPrevious} label="Previous screen" shortcut="←">
        <ChevronLeftIcon variant="small" />
      </NavButton>
      <NavButton onClick={onNext} disabled={!onNext} label="Next screen" shortcut="→">
        <ChevronRightIcon variant="small" />
      </NavButton>
    </Flex>
  );
}

interface FromHereProps<S extends string> {
  transitions: FlowTransition<S>[];
  // Indexes of transitions with a hotspot on screen.
  found: Set<number>;
  labelOf(screen: S): string;
  onNavigate(to: S): void;
}

// Under the screen: every way out of it. Each is a button too, so the flow can
// be walked even where a hotspot isn't wired.
function FromHere<S extends string>({ transitions, found, labelOf, onNavigate }: FromHereProps<S>) {
  if (transitions.length === 0)
    return (
      <styled.span textStyle="caption.01" color="ink.text-subdued" flexShrink={0}>
        End of the flow: no way on from this screen.
      </styled.span>
    );
  return (
    <Stack gap="space.02" alignItems="center" flexShrink={0} data-from-here>
      <styled.span textStyle="caption.02" color="ink.text-subdued">
        From here · click the screen, or
      </styled.span>
      <Flex gap="space.02" flexWrap="wrap" justifyContent="center">
        {transitions.map((transition, index) => (
          <Pressable
            {...plainPressable}
            key={`${transition.to}-${transition.trigger}`}
            type="button"
            width="auto"
            onClick={() => onNavigate(transition.to)}
            data-hotspot={found.has(index) ? 'found' : 'missing'}
            display="flex"
            alignItems="center"
            gap="space.02"
            px="space.03"
            py="space.01"
            borderWidth={1}
            borderStyle={found.has(index) ? 'solid' : 'dashed'}
            borderColor="ink.border-default"
            borderRadius="round"
            bg="ink.background-primary"
            cursor="pointer"
            _hover={{ bg: 'ink.component-background-hover' }}
            _focusVisible={{ outline: 'focus', outlineOffset: '2px' }}
            title={
              found.has(index)
                ? 'Also a hotspot on the screen'
                : 'No hotspot on the screen for this one'
            }
          >
            <styled.span textStyle="caption.01" color="ink.text-secondary">
              {transition.trigger}
            </styled.span>
            <styled.span textStyle="label.03" color="ink.text-primary">
              → {labelOf(transition.to)}
            </styled.span>
          </Pressable>
        ))}
      </Flex>
    </Stack>
  );
}

// The single view fills the canvas height: nav on top, the stage (fitted, so
// the frame always shows whole), then a line or two under it.
function SingleLayout({
  nav,
  stage,
  footer,
}: {
  nav: ReactNode;
  stage: ReactNode;
  footer: ReactNode;
}) {
  return (
    <Flex
      direction="column"
      alignItems="center"
      gap="space.04"
      height="100%"
      px="space.05"
      pt="space.04"
      pb="space.03"
    >
      {nav}
      <ScaleToFit fitHeight>{stage}</ScaleToFit>
      {footer}
    </Flex>
  );
}

interface SingleScreenProps<V extends string, S extends string> extends CanvasProps<V, S> {
  showHotspots: boolean;
  onGo(screen: S): void;
}

function SingleScreen<V extends string, S extends string>({
  config,
  params,
  showHotspots,
  onGo,
}: SingleScreenProps<V, S>) {
  const size = frameSizes[params.frame];
  const flow = variantFlow(config, params.variant);
  const index = flow.order.indexOf(params.screen);
  const outgoing = flow.transitions.filter(transition => transition.from === params.screen);
  function labelOf(screen: S) {
    return config.screens[screen].label;
  }
  const [found, setFound] = useState<Set<number>>(new Set());
  const onCoverage = useCallback((next: Set<number>) => {
    setFound(current =>
      current.size === next.size && [...next].every(item => current.has(item)) ? current : next
    );
  }, []);
  const previous = index > 0 ? flow.order[index - 1] : undefined;
  const next = index >= 0 && index < flow.order.length - 1 ? flow.order[index + 1] : undefined;

  return (
    <SingleLayout
      nav={
        <StepNav
          onPrevious={previous ? () => onGo(previous) : undefined}
          onNext={next ? () => onGo(next) : undefined}
        />
      }
      stage={
        <Flex gap="space.05" alignItems="flex-start">
          <Stack gap="space.02" alignItems="center">
            <FrameLabel>
              {[size.label, params.theme === 'dark' ? 'Dark' : 'Light'].join(' · ')}
            </FrameLabel>
            <ClickThrough
              transitions={outgoing}
              showHotspots={showHotspots}
              onNavigate={onGo}
              onCoverage={onCoverage}
            >
              <FramedScreen
                config={config}
                params={params}
                screen={params.screen}
                onNavigate={to => {
                  const target = config.screenIds.find(id => id === to);
                  if (target) onGo(target);
                }}
              />
            </ClickThrough>
          </Stack>
          {params.compare ? (
            <TodayRail
              today={config.today}
              job={screenJob(config, params.variant, params.screen)}
              notInToday={config.screens[params.screen].notInToday}
              flowId={compareFlowId(config, params.variant)}
              frame={frameLayout(params.frame)}
              theme={params.theme}
            />
          ) : null}
        </Flex>
      }
      footer={<FromHere transitions={outgoing} found={found} labelOf={labelOf} onNavigate={onGo} />}
    />
  );
}

const sheetGap = 24;

// The canvas width a sheet has, kept current as the rails open and close.
function useWidth() {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(() => setWidth(element.clientWidth));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return [setElement, width] as const;
}

interface SheetItem {
  key: string;
  // "3 · Review": the same for a concept screen and a real step.
  label: string;
  // A second line, only when comparing (how a real step fares in the concept).
  caption?: string;
  frame: ReactNode;
  onOpen(): void;
}

// The grid every contact sheet uses, concept or today: popup frames, at least
// two to a row (three when there's room), scaled down to fit. `dense` (the
// Overview) fits more to a row. A label or a frame opens that screen; hover
// and focus stay inside the item.
function SheetGrid({ items, dense = false }: { items: SheetItem[]; dense?: boolean }) {
  const [measure, width] = useWidth();
  const frameWidth = frameSizes.popup.width;
  const minWidth = dense ? 180 : frameWidth;
  const fits = Math.floor((width + sheetGap) / (minWidth + sheetGap));
  const columns = Math.max(2, dense ? fits : Math.min(3, fits));
  const scale = width
    ? Math.min(
        1,
        Math.floor(((width - (columns - 1) * sheetGap) / (columns * frameWidth)) * 1000) / 1000
      )
    : 1;
  return (
    <Box
      ref={measure}
      display="grid"
      columnGap={`${sheetGap}px`}
      rowGap="space.05"
      justifyContent="start"
      style={{ gridTemplateColumns: `repeat(${columns}, ${Math.floor(frameWidth * scale)}px)` }}
    >
      {items.map(item => (
        <Stack key={item.key} gap="space.02" data-sheet-item={item.key} minWidth="0">
          <Stack gap="0" minWidth="0">
            <Pressable
              {...plainPressable}
              type="button"
              onClick={item.onOpen}
              title="Open this screen"
              width="auto"
              bg="transparent"
              alignSelf="flex-start"
              textAlign="left"
              cursor="pointer"
              borderRadius="xs"
              _hover={{ textDecoration: 'underline' }}
              _focusVisible={{ outline: 'focus', outlineOffset: '-2px' }}
            >
              <FrameLabel>{item.label}</FrameLabel>
            </Pressable>
            {item.caption ? (
              <styled.span textStyle="caption.02" color="ink.text-subdued" truncate>
                {item.caption}
              </styled.span>
            ) : null}
          </Stack>
          {/* zoom (not transform) so the scaled frame takes its scaled space */}
          <Box position="relative" style={{ zoom: scale }}>
            {item.frame}
            <Pressable
              {...plainPressable}
              type="button"
              aria-label={`Open ${item.label}`}
              onClick={item.onOpen}
              position="absolute"
              inset="0"
              width="100%"
              height="100%"
              bg="transparent"
              cursor="pointer"
              borderWidth="3px"
              borderColor="transparent"
              _hover={{ borderColor: 'ink.border-default' }}
              _focusVisible={{ outline: 'none', borderColor: 'ink.text-primary' }}
            />
          </Box>
        </Stack>
      ))}
    </Box>
  );
}

// A concept's (or the recreated Today's) screens in flow order.
function conceptItems<V extends string, S extends string>(
  config: ExplorationConfig<V, S>,
  params: ExplorationParams<V, S>,
  variant: V,
  onOpen: (variant: V, screen: S) => void
): SheetItem[] {
  const sheetParams: ExplorationParams<V, S> = { ...params, variant, frame: 'popup' };
  return variantFlow(config, variant).order.map((screen, index) => ({
    key: `${variant}-${screen}`,
    label: `${index + 1} · ${config.screens[screen].label}`,
    frame: <FramedScreen config={config} params={sheetParams} screen={screen} />,
    onOpen: () => onOpen(variant, screen),
  }));
}

interface TodaySheetProps<V extends string, S extends string> extends CanvasProps<V, S> {
  coverage?: TodayCoverage;
  dense?: boolean;
  onOpen(step: string): void;
}

// Today's screenshots as a contact sheet: one grid per flow (a flow's name
// above it when there are several), the same frames and labels as a concept.
function TodaySheet<V extends string, S extends string>({
  config,
  params,
  coverage,
  dense,
  onOpen,
}: TodaySheetProps<V, S>) {
  const steps = todaySteps(config.today);
  const several = config.today.flows.length > 1;
  return (
    <Stack gap="space.05">
      {config.today.flows.map(flow => (
        <Stack key={flow.id} gap="space.03">
          {several ? (
            <styled.span textStyle="label.03" color="ink.text-secondary">
              {flow.label}
            </styled.span>
          ) : null}
          <SheetGrid
            dense={dense}
            items={steps
              .filter(entry => entry.flow.id === flow.id)
              .map(entry => ({
                key: `today-${entry.step.name}`,
                label: `${entry.number} · ${entry.step.label}`,
                caption: coverage ? coverageLine(entry.step, coverage) : undefined,
                frame: <TodayFrame today={config.today} step={entry.step} theme={params.theme} />,
                onOpen: () => onOpen(entry.step.name),
              }))}
          />
        </Stack>
      ))}
    </Stack>
  );
}

interface SheetHeadingProps {
  title: string;
  meta?: string;
  onOpen(): void;
}

// A sheet's heading on Overview (and above today's sheet in a comparison):
// opens that sheet.
function SheetHeading({ title, meta, onOpen }: SheetHeadingProps) {
  return (
    <Pressable
      {...plainPressable}
      type="button"
      onClick={onOpen}
      title={`Open ${title}`}
      width="auto"
      alignSelf="flex-start"
      display="flex"
      alignItems="baseline"
      gap="space.03"
      bg="transparent"
      cursor="pointer"
      borderRadius="xs"
      _hover={{ '& > span:first-child': { textDecoration: 'underline' } }}
      _focusVisible={{ outline: 'focus', outlineOffset: '2px' }}
    >
      <styled.span textStyle="label.01" color="ink.text-primary">
        {title}
      </styled.span>
      {meta ? (
        <styled.span textStyle="caption.01" color="ink.text-subdued">
          {meta}
        </styled.span>
      ) : null}
    </Pressable>
  );
}

interface SheetViewProps<V extends string, S extends string> extends CanvasProps<V, S> {
  onOpenScreen(variant: V, screen: S): void;
  onOpenStep(step: string): void;
  onOpenToday(): void;
}

// One selection's contact sheet. With "Compare with today", today's sheet
// follows in the same grid, each real step saying how the concept treats it.
function ContactSheet<V extends string, S extends string>({
  config,
  params,
  onOpenScreen,
  onOpenStep,
  onOpenToday,
}: SheetViewProps<V, S>) {
  if (params.actual)
    return (
      <Box p="space.05">
        <TodaySheet config={config} params={params} onOpen={onOpenStep} />
      </Box>
    );
  return (
    <Stack gap="space.07" p="space.05">
      <SheetGrid items={conceptItems(config, params, params.variant, onOpenScreen)} />
      {params.compare ? (
        <Stack
          gap="space.04"
          borderTopWidth={1}
          borderTopStyle="solid"
          borderColor="ink.border-default"
          pt="space.05"
        >
          <SheetHeading
            title="Today"
            meta="Real screenshots · how this concept treats each step"
            onOpen={onOpenToday}
          />
          <TodaySheet
            config={config}
            params={params}
            coverage={coverageFor({ config, params })}
            onOpen={onOpenStep}
          />
        </Stack>
      ) : null}
    </Stack>
  );
}

// Overview: every sheet stacked, Today first, then each concept.
function Overview<V extends string, S extends string>({
  config,
  params,
  onOpenScreen,
  onOpenStep,
  onOpenToday,
  onOpenSheet,
}: SheetViewProps<V, S> & { onOpenSheet(variant: V): void }) {
  const recreated = recreatedToday(config);
  return (
    <Stack gap="space.07" p="space.05">
      <Stack as="section" gap="space.04" data-overview="today">
        <SheetHeading
          title="Today"
          meta={recreated ? 'Recreated flow' : 'Screenshots'}
          onOpen={onOpenToday}
        />
        {recreated ? (
          <SheetGrid dense items={conceptItems(config, params, recreated, onOpenScreen)} />
        ) : (
          <TodaySheet config={config} params={params} dense onOpen={onOpenStep} />
        )}
      </Stack>
      {conceptIds(config).map(variant => (
        <Stack
          as="section"
          key={variant}
          gap="space.04"
          borderTopWidth={1}
          borderTopStyle="solid"
          borderColor="ink.border-default"
          pt="space.06"
          data-overview={variant}
        >
          <SheetHeading
            title={variantTitle(config, variant)}
            meta={config.variants[variant].module.meta.summary}
            onOpen={() => onOpenSheet(variant)}
          />
          <SheetGrid dense items={conceptItems(config, params, variant, onOpenScreen)} />
        </Stack>
      ))}
    </Stack>
  );
}

interface TodayViewProps<V extends string, S extends string> extends CanvasProps<V, S> {
  onStep(step: string): void;
}

// Today's screenshots, one real step (click it for the next).
function TodayView<V extends string, S extends string>({
  config,
  params,
  onStep,
}: TodayViewProps<V, S>) {
  const steps = todaySteps(config.today);
  const entry = currentStep(steps, params.step);
  if (!entry) return null;
  const index = steps.indexOf(entry);
  const previous = steps[index - 1];
  const next = steps[index + 1];
  const frame = frameLayout(params.frame);
  return (
    <SingleLayout
      nav={
        <StepNav
          onPrevious={previous ? () => onStep(previous.step.name) : undefined}
          onNext={next ? () => onStep(next.step.name) : undefined}
        />
      }
      stage={
        <Stack gap="space.02" alignItems="center">
          <FrameLabel>
            {[
              frame === 'tab' && !entry.step.popupOnly ? 'Tab capture' : 'Popup capture',
              params.theme === 'dark' ? 'Dark' : 'Light',
              entry.step.popupOnly && frame === 'tab' ? 'popup only' : '',
            ]
              .filter(Boolean)
              .join(' · ')}
          </FrameLabel>
          <TodayScreen
            today={config.today}
            entry={entry}
            frame={frame}
            theme={params.theme}
            onNext={next ? () => onStep(next.step.name) : undefined}
            nextLabel={next ? `Next: ${next.step.label}` : undefined}
          />
        </Stack>
      }
      footer={
        <styled.span textStyle="caption.01" color="ink.text-subdued" flexShrink={0}>
          {next ? `Click the screenshot for ${next.step.label}` : 'Last step'}
        </styled.span>
      }
    />
  );
}

function canvasLabel<V extends string, S extends string>(
  config: ExplorationConfig<V, S>,
  params: ExplorationParams<V, S>
) {
  if (params.overview) return 'All';
  if (params.actual) return 'Today';
  if (params.sheet) return `${viewLabel(config, params.variant)} · contact sheet`;
  return viewLabel(config, params.variant, params.screen);
}

// What the rails and canvas re-mount on.
function selectionKey<V extends string, S extends string>(params: ExplorationParams<V, S>) {
  if (params.overview) return 'overview';
  if (params.actual) return 'actual';
  return params.variant;
}

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
    target.getAttribute('role') === 'textbox'
  );
}

function cycle<T>(list: readonly T[], current: T, delta: number) {
  const index = list.indexOf(current);
  if (index < 0) return list[delta > 0 ? 0 : list.length - 1];
  return list[(index + delta + list.length) % list.length];
}

// The canvas follows the theme param too, so the rails and the real
// screenshots sit on a matching background.
export function ExplorationCanvas<V extends string, S extends string>({
  config,
}: {
  config: ExplorationConfig<V, S>;
}) {
  const { params, update } = useExplorationParams(config);
  const [navOpen, setNavOpen] = useRailOpen('navigator');
  const [infoOpen, setInfoOpen] = useRailOpen('info');
  const [pinnedHotspots, setPinnedHotspots] = useState(false);
  const [heldHotspots, setHeldHotspots] = useState(false);
  const showHotspots = pinnedHotspots || heldHotspots;

  const recreated = recreatedToday(config);
  const concepts = conceptIds(config);
  // A baseline that isn't the Today entry is left out of the canvas.
  const hidden = recreated ? undefined : config.baselineVariant;
  const flow = variantFlow(config, params.variant);
  const steps = todaySteps(config.today);
  const today = isToday(config, params);

  // An old link to the left-out baseline lands on Today's screenshots.
  useEffect(() => {
    if (!params.overview && !params.actual && params.variant === hidden)
      update({ actual: true, variant: concepts[0] });
  });

  function go(screen: S) {
    update({ screen, sheet: false });
  }

  function openScreen(variant: V, screen: S) {
    update({ overview: false, actual: false, variant, screen, sheet: false });
  }

  function openStep(step: string) {
    update({ overview: false, actual: true, step, sheet: false });
  }

  function selectToday(view?: Partial<ExplorationParams<V, S>>) {
    if (recreated) update({ overview: false, actual: false, variant: recreated, ...view });
    else update({ overview: false, actual: true, ...view });
  }

  function selectVariant(variant: V, view?: Partial<ExplorationParams<V, S>>) {
    update({ overview: false, actual: false, variant, ...view });
  }

  function selectView(view: ViewId) {
    if (view === 'overview') {
      update({ overview: true });
      return;
    }
    const sheet = view === 'sheet';
    if (!params.overview) update({ sheet });
    // Leaving Overview: back to the concept it remembers.
    else if (params.variant === recreated) selectToday({ sheet });
    else selectVariant(params.variant === hidden ? concepts[0] : params.variant, { sheet });
  }

  function moveScreen(delta: number) {
    if (params.overview) return;
    if (params.actual) {
      const entry = currentStep(steps, params.step);
      const next = steps[steps.indexOf(entry) + delta];
      if (next) update({ step: next.step.name, sheet: false });
      return;
    }
    const next = flow.order[flow.order.indexOf(params.screen) + delta];
    if (next) go(next);
  }

  // [ and ]: Today, then each concept.
  function moveVariant(delta: number) {
    const entries: (V | 'today')[] = ['today', ...concepts];
    const current = today ? 'today' : params.variant;
    const next = params.overview ? entries[0] : cycle(entries, current, delta);
    if (next === 'today') selectToday();
    else selectVariant(next);
  }

  // Keyboard: see the shortcut list in the navigation rail's footer. Re-bound
  // each render so the handler sees the current params.
  function onKey(event: KeyboardEvent) {
    if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
    const { key } = event;
    if (event.type === 'keyup') {
      if (key === 'h') setHeldHotspots(false);
      return;
    }
    if (key === 'h') {
      if (!event.repeat) setHeldHotspots(true);
      return;
    }
    const view = currentView(params);
    if (key === 'ArrowRight') moveScreen(1);
    else if (key === 'ArrowLeft') moveScreen(-1);
    else if (key === ']') moveVariant(1);
    else if (key === '[') moveVariant(-1);
    else if (key === 'o') selectView('overview');
    else if (key === 's') selectView(view === 'single' ? 'sheet' : 'single');
    else if (key === 'c' && !params.actual && !params.overview)
      update({ compare: !params.compare });
    else if (key === 'd') update({ theme: cycle(themeIds, params.theme, 1) });
    else if (key === 'f' && view === 'single')
      update({ frame: cycle(params.actual ? frameIds : frameSizeIds, params.frame, 1) });
    else if (key === '\\') setNavOpen(!navOpen);
    else if (key === 'i') setInfoOpen(!infoOpen);
    else return;
    event.preventDefault();
  }

  useEffect(() => {
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  });

  const view = currentView(params);
  const centerLabel = `${config.title} · ${canvasLabel(config, params)}`;
  const selection = selectionKey(params);
  const sheetHandlers = {
    onOpenScreen: openScreen,
    onOpenStep: openStep,
    onOpenToday: () => selectToday({ sheet: true }),
  };

  function canvas() {
    if (params.overview)
      return (
        <Overview
          config={config}
          params={params}
          {...sheetHandlers}
          onOpenSheet={variant => selectVariant(variant, { sheet: true })}
        />
      );
    if (params.sheet) return <ContactSheet config={config} params={params} {...sheetHandlers} />;
    if (params.actual)
      return (
        <TodayView
          config={config}
          params={params}
          onStep={step => update({ step, sheet: false })}
        />
      );
    return <SingleScreen config={config} params={params} showHotspots={showHotspots} onGo={go} />;
  }

  return (
    <Box
      className={params.theme === 'dark' ? 'dark' : undefined}
      height="100vh"
      overflow="hidden"
      bg="ink.background-secondary"
      color="ink.text-primary"
    >
      <LightboxProvider>
        <Flex height="100vh">
          <CanvasBoundary key={`nav-${selection}`} label={`${config.title} · navigation`}>
            <NavigatorRail
              config={config}
              params={params}
              open={navOpen}
              showHotspots={showHotspots}
              onToggleOpen={() => setNavOpen(!navOpen)}
              onShowHotspots={setPinnedHotspots}
              onSelectToday={() => selectToday()}
              onSelectVariant={variant => selectVariant(variant)}
              onSelectScreen={go}
              onSelectStep={step => update({ step, sheet: false })}
              onSelectView={selectView}
              onChange={update}
            />
          </CanvasBoundary>
          <CanvasBoundary key={`info-${selection}`} label={`${config.title} · information`}>
            <InfoRail
              config={config}
              params={params}
              open={infoOpen}
              onToggleOpen={() => setInfoOpen(!infoOpen)}
            />
          </CanvasBoundary>
          <Flex
            as="section"
            direction="column"
            flex="1"
            minWidth="0"
            height="100vh"
            aria-label={centerLabel}
          >
            {/* The canvas scrolls on its own and ends above a clear strip for
                the playground's floating dock pill, so nothing ever sits under
                it. Keyed by view so a new view starts at the top. */}
            <Box key={`${selection}-${view}`} flex="1" minHeight="0" overflowY="auto">
              <CanvasBoundary key={`${selection}-${view}-${params.screen}`} label={centerLabel}>
                {canvas()}
              </CanvasBoundary>
            </Box>
            <Box aria-hidden flexShrink={0} style={{ height: dockClearance }} />
          </Flex>
        </Flex>
        <HotspotHint visible={heldHotspots && view === 'single' && !params.actual} />
      </LightboxProvider>
    </Box>
  );
}

function HotspotHint({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <Box
      position="fixed"
      top="space.04"
      left="50%"
      transform="translateX(-50%)"
      zIndex={20}
      px="space.03"
      py="space.01"
      borderRadius="round"
      bg="ink.background-primary"
      borderWidth={1}
      borderStyle="solid"
      borderColor="ink.border-default"
    >
      <styled.span textStyle="caption.01" color="ink.text-secondary">
        Showing hotspots · release <Kbd>h</Kbd>
      </styled.span>
    </Box>
  );
}
