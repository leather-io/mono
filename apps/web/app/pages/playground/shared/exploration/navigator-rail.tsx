import { Stack, styled } from 'leather-styles/jsx';

import {
  type ExplorationConfig,
  type ResolvedFlow,
  conceptIds,
  recreatedToday,
  variantFlow,
  variantTitle,
} from './exploration-config';
import { frameIds, frameSizeIds, themeIds } from './frame';
import { Choice, Kbd, Rail, RailHeading, RailItem, Toggle } from './rail';
import { type NumberedStep, todaySteps } from './today-flow';
import type { ExplorationParams } from './use-exploration-params';

const themeLabels = { light: 'Light', dark: 'Dark' } as const;
const frameLabels = { popup: 'Popup', 'request-window': 'Request', tab: 'Tab' } as const;
const viewIds = ['overview', 'single', 'sheet'] as const;
export type ViewId = (typeof viewIds)[number];
const viewLabels = { overview: 'All', single: 'Single', sheet: 'Sheet' } as const;

export function currentView(params: { overview: boolean; sheet: boolean }): ViewId {
  if (params.overview) return 'overview';
  return params.sheet ? 'sheet' : 'single';
}

function howYouGetHere<S extends string>(
  flow: ResolvedFlow<S>,
  screen: S,
  labelOf: (screen: S) => string
) {
  const entry = flow.entries[screen];
  if (entry) return entry;
  const incoming = flow.transitions.filter(transition => transition.to === screen);
  if (incoming.length === 0) return undefined;
  const [first, ...rest] = incoming;
  const more = rest.length ? ` (+${rest.length})` : '';
  return `From ${labelOf(first.from)} · ${first.trigger}${more}`;
}

export function isToday<V extends string, S extends string>(
  config: ExplorationConfig<V, S>,
  params: ExplorationParams<V, S>
) {
  if (params.overview || !hasToday(config)) return false;
  return params.actual || params.variant === recreatedToday(config);
}

export function hasToday<V extends string, S extends string>(config: ExplorationConfig<V, S>) {
  return Boolean(recreatedToday(config)) || todaySteps(config.today).length > 0;
}

interface NavigatorRailProps<V extends string, S extends string> {
  config: ExplorationConfig<V, S>;
  params: ExplorationParams<V, S>;
  open: boolean;
  showHotspots: boolean;
  onToggleOpen(): void;
  onShowHotspots(show: boolean): void;
  onSelectToday(): void;
  onSelectVariant(variant: V): void;
  onSelectScreen(screen: S): void;
  onSelectStep(step: string): void;
  onSelectView(view: ViewId): void;
  onChange(next: Partial<ExplorationParams<V, S>>): void;
}

export function NavigatorRail<V extends string, S extends string>({
  config,
  params,
  open,
  showHotspots,
  onToggleOpen,
  onShowHotspots,
  onSelectToday,
  onSelectVariant,
  onSelectScreen,
  onSelectStep,
  onSelectView,
  onChange,
}: NavigatorRailProps<V, S>) {
  const today = isToday(config, params);
  // The All view is always popup frames, with nothing to compare or click.
  const { overview } = params;
  return (
    <Rail
      label="Navigation"
      open={open}
      width={272}
      shortcut="\"
      onToggle={onToggleOpen}
      header={
        <Stack gap="0">
          <styled.span textStyle="caption.02" color="ink.text-subdued">
            Exploration
          </styled.span>
          <styled.h1 textStyle="label.01" color="ink.text-primary">
            {config.title}
          </styled.h1>
        </Stack>
      }
      footer={
        <Stack gap="space.02">
          <Choice
            label="View"
            options={viewIds}
            labels={viewLabels}
            value={currentView(params)}
            hint="s · o"
            onChange={onSelectView}
          />
          <Choice
            label="Frame"
            options={params.actual ? frameIds : frameSizeIds}
            labels={frameLabels}
            value={params.actual && params.frame === 'request-window' ? 'popup' : params.frame}
            disabled={params.sheet || overview}
            hint={params.sheet || overview ? 'Contact sheets are always popup' : 'f'}
            onChange={frame => onChange({ frame })}
          />
          <Choice
            label="Theme"
            options={themeIds}
            labels={themeLabels}
            value={params.theme}
            hint="d"
            onChange={theme => onChange({ theme })}
          />
          <Stack gap="0" pt="space.01">
            {hasToday(config) ? (
              <Toggle
                label="Compare with today"
                checked={params.compare && !params.actual && !overview}
                disabled={params.actual || overview}
                shortcut="c"
                onChange={compare => onChange({ compare })}
              />
            ) : null}
            <Toggle
              label="Show hotspots"
              checked={showHotspots && !params.actual && !params.sheet && !overview}
              disabled={params.sheet || params.actual || overview}
              shortcut="h"
              onChange={onShowHotspots}
            />
          </Stack>
          <Shortcuts />
        </Stack>
      }
    >
      <Stack gap="space.05" pb="space.05">
        {hasToday(config) ? (
          <Stack gap="0">
            <RailHeading>Today</RailHeading>
            <Stack gap="1px" px="space.02">
              <RailItem
                data-item="today"
                selected={today}
                onSelect={onSelectToday}
                title={recreatedToday(config) ? 'Recreated flow' : 'Screenshots'}
                hint={
                  recreatedToday(config)
                    ? 'The shipped flow, recreated and checked against the captures'
                    : 'The shipped extension, captured'
                }
              />
            </Stack>
          </Stack>
        ) : null}
        <Stack gap="0">
          <RailHeading>Variants</RailHeading>
          <Stack gap="1px" px="space.02">
            {conceptIds(config).map(id => (
              <RailItem
                key={id}
                data-item={id}
                selected={!overview && !today && params.variant === id}
                onSelect={() => onSelectVariant(id)}
                title={variantTitle(config, id)}
                hint={config.variants[id].module.meta.summary}
              />
            ))}
          </Stack>
        </Stack>
        {overview ? null : (
          <Screens
            config={config}
            params={params}
            onSelectScreen={onSelectScreen}
            onSelectStep={onSelectStep}
          />
        )}
      </Stack>
    </Rail>
  );
}

interface ScreensProps<V extends string, S extends string> {
  config: ExplorationConfig<V, S>;
  params: ExplorationParams<V, S>;
  onSelectScreen(screen: S): void;
  onSelectStep(step: string): void;
}

function Screens<V extends string, S extends string>({
  config,
  params,
  onSelectScreen,
  onSelectStep,
}: ScreensProps<V, S>) {
  if (params.actual) return <StepList config={config} params={params} onSelect={onSelectStep} />;
  return <ScreenList config={config} params={params} onSelect={onSelectScreen} />;
}

interface ScreenListProps<V extends string, S extends string> {
  config: ExplorationConfig<V, S>;
  params: ExplorationParams<V, S>;
  onSelect(screen: S): void;
}

function ScreenList<V extends string, S extends string>({
  config,
  params,
  onSelect,
}: ScreenListProps<V, S>) {
  const flow = variantFlow(config, params.variant);
  const hasFlow = flow.transitions.length > 0 || Object.keys(flow.entries).length > 0;
  function labelOf(screen: S) {
    return config.screens[screen].label;
  }
  return (
    <Stack gap="0">
      <RailHeading>Screens</RailHeading>
      <styled.ol display="flex" flexDir="column" gap="1px" px="space.02">
        {flow.order.map((screen, index) => {
          const way = howYouGetHere(flow, screen, labelOf);
          return (
            <li key={screen}>
              <RailItem
                data-item={screen}
                selected={!params.sheet && params.screen === screen}
                onSelect={() => onSelect(screen)}
                leading={index + 1}
                title={labelOf(screen)}
                caption={way ?? (hasFlow ? 'No way in shown yet' : undefined)}
              />
            </li>
          );
        })}
      </styled.ol>
    </Stack>
  );
}

interface StepListProps<V extends string, S extends string> {
  config: ExplorationConfig<V, S>;
  params: ExplorationParams<V, S>;
  onSelect(step: string): void;
}

function StepList<V extends string, S extends string>({
  config,
  params,
  onSelect,
}: StepListProps<V, S>) {
  const steps = todaySteps(config.today);
  const current = currentStep(steps, params.step);
  return (
    <Stack gap="space.03">
      <RailHeading>Screens</RailHeading>
      {config.today.flows.map(flow => (
        <Stack key={flow.id} gap="0">
          <styled.span textStyle="caption.02" color="ink.text-subdued" px="space.04" pb="space.01">
            {flow.label}
          </styled.span>
          <styled.ol display="flex" flexDir="column" gap="1px" px="space.02">
            {steps
              .filter(entry => entry.flow.id === flow.id)
              .map(entry => (
                <li key={entry.step.name}>
                  <RailItem
                    data-item={entry.step.name}
                    selected={!params.sheet && current?.step.name === entry.step.name}
                    muted={entry.step.missing}
                    onSelect={() => onSelect(entry.step.name)}
                    leading={entry.number}
                    title={entry.step.label}
                    caption={entry.step.missing ? 'Not captured' : (entry.step.note ?? undefined)}
                  />
                </li>
              ))}
          </styled.ol>
        </Stack>
      ))}
    </Stack>
  );
}

export function currentStep(steps: NumberedStep[], name: string | null) {
  return steps.find(entry => entry.step.name === name) ?? steps[0];
}

const shortcutList: [string, string][] = [
  ['← →', 'screen'],
  ['[ ]', 'variant'],
  ['h', 'hold for hotspots'],
  ['o', 'all screens'],
  ['s', 'single / sheet'],
  ['f', 'frame'],
  ['d', 'theme'],
  ['c', 'compare'],
  ['\\', 'this rail'],
  ['i', 'info rail'],
];

function Shortcuts() {
  return (
    <styled.details>
      <styled.summary
        listStyle="none"
        cursor="pointer"
        textStyle="caption.02"
        color="ink.text-subdued"
        _hover={{ color: 'ink.text-primary' }}
        _focusVisible={{ outline: 'focus' }}
        css={{ '&::-webkit-details-marker': { display: 'none' } }}
      >
        Keyboard shortcuts
      </styled.summary>
      <styled.dl
        display="grid"
        gridTemplateColumns="auto 1fr auto 1fr"
        columnGap="space.02"
        rowGap="space.01"
        alignItems="center"
        pt="space.02"
      >
        {shortcutList.map(([keys, label]) => (
          <Pair key={label} keys={keys} label={label} />
        ))}
      </styled.dl>
    </styled.details>
  );
}

function Pair({ keys, label }: { keys: string; label: string }) {
  return (
    <>
      <dt>
        <Kbd>{keys}</Kbd>
      </dt>
      <styled.dd textStyle="caption.02" color="ink.text-subdued">
        {label}
      </styled.dd>
    </>
  );
}
