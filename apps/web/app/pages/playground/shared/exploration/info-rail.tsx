// The info rail (second of the two left rails): what's on the canvas. It
// starts straight with the description (no title: the navigation rail names
// the selection), then the concept, notes and assumptions, Inspiration (every
// reference screen across the area) and "How we got here" (closed). On Today:
// today's flows in place of the concept. On Overview: what the overview is.
import { Stack, styled } from 'leather-styles/jsx';

import { Assumptions } from './assumptions';
import { ConceptDetails, HowWeGotHere } from './concept-panel';
import { type ExplorationConfig, conceptIds } from './exploration-config';
import { Inspiration, type InspirationItem } from './inspiration';
import { hasToday, isToday } from './navigator-rail';
import { Rail } from './rail';
import { ColumnLabel, RailDisclosure } from './section';
import type { ExplorationParams } from './use-exploration-params';

interface InfoRailProps<V extends string, S extends string> {
  config: ExplorationConfig<V, S>;
  params: ExplorationParams<V, S>;
  open: boolean;
  onToggleOpen(): void;
}

export function InfoRail<V extends string, S extends string>({
  config,
  params,
  open,
  onToggleOpen,
}: InfoRailProps<V, S>) {
  const today = isToday(config, params);
  // The variant whose concept and notes show: none on Overview or on Today's
  // screenshots.
  const shown = params.overview || params.actual ? undefined : params.variant;
  const concept = shown ? config.concepts[shown] : undefined;
  return (
    <Rail
      as="aside"
      label="Information"
      open={open}
      width={336}
      shortcut="i"
      onToggle={onToggleOpen}
    >
      <Stack gap="0">
        <styled.p
          textStyle="body.02"
          color="ink.text-secondary"
          pl="space.04"
          pr="space.06"
          py="space.04"
          borderBottomWidth={1}
          borderBottomStyle="solid"
          borderColor="ink.border-default"
        >
          {description(config, params, today)}
        </styled.p>
        {concept ? <ConceptDetails concept={concept} /> : null}
        {today ? <TodayFlows config={config} /> : null}
        <Assumptions
          notes={shown ? config.variants[shown].notes : undefined}
          assumptions={config.assumptions}
        />
        <Inspiration items={inspirationItems(config, shown)} path={config.references.path} />
        <HowWeGotHere journey={config.journey} />
      </Stack>
    </Rail>
  );
}

function description<V extends string, S extends string>(
  config: ExplorationConfig<V, S>,
  params: ExplorationParams<V, S>,
  today: boolean
) {
  if (params.overview) {
    const count = conceptIds(config).length;
    const concepts = `${count} ${count === 1 ? 'concept' : 'concepts'}`;
    const contents = hasToday(config) ? `Today’s flow, then ${concepts}` : concepts;
    return `${contents}. Click a heading to open a concept, or a frame to open that screen.`;
  }
  if (today && params.actual)
    return 'Real screenshots of the shipped flow: the reference every concept is judged against.';
  return config.variants[params.variant].module.meta.summary;
}

function TodayFlows<V extends string, S extends string>({
  config,
}: {
  config: ExplorationConfig<V, S>;
}) {
  const cuts = config.today.cuts ?? [];
  return (
    <RailDisclosure title="Today’s flows" meta={`${config.today.flows.length} flows`} defaultOpen>
      <Stack gap="space.04">
        {config.today.flows.map(flow => (
          <Stack key={flow.id} gap="space.01">
            <ColumnLabel>{flow.label}</ColumnLabel>
            <styled.p textStyle="body.02" color="ink.text-primary">
              {flow.caption}
            </styled.p>
            <styled.span textStyle="caption.02" color="ink.text-subdued">
              {`Steps ${flow.startAt}–${flow.startAt + flow.steps.length - 1}`}
            </styled.span>
          </Stack>
        ))}
        {cuts.length ? (
          <Stack gap="space.01">
            <ColumnLabel>Cut by every concept</ColumnLabel>
            {cuts.map(cut => (
              <styled.p key={cut.step} textStyle="body.02" color="ink.text-primary">
                {cut.step}: {cut.why}
              </styled.p>
            ))}
          </Stack>
        ) : null}
      </Stack>
    </RailDisclosure>
  );
}

// Every reference across the area's variants, once each (by image, or app and
// line for text sources), with the variants that used it. The shown variant's
// come first.
function inspirationItems<V extends string, S extends string>(
  config: ExplorationConfig<V, S>,
  shown: V | undefined
) {
  const byKey = new Map<string, InspirationItem>();
  for (const variant of config.variantIds) {
    const label = config.variants[variant].label;
    for (const group of config.references.byVariant[variant] ?? []) {
      for (const reference of group.references) {
        const key = reference.image ?? `${reference.app}·${reference.took}`;
        const item = byKey.get(key);
        if (item) {
          if (!item.usedBy.includes(label)) item.usedBy.push(label);
          item.current ||= variant === shown;
        } else
          byKey.set(key, {
            reference,
            usedBy: [label],
            current: variant === shown,
          });
      }
    }
  }
  const items = [...byKey.values()];
  return [...items.filter(item => item.current), ...items.filter(item => !item.current)];
}
