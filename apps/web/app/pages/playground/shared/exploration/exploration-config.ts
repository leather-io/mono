// The typed config behind an exploration canvas. One area = one config:
// variants, screens, today's real flow (by job), concepts, references.
// See docs/design/explore.md for the protocol this canvas presents.
import type { ComponentType } from 'react';

import type { FrameId, ThemeId } from './frame';

// What the canvas passes to every screen. Screens render the frame's content
// only; the canvas draws the frame around them.
export interface ScreenProps {
  frame: FrameId;
  theme: ThemeId;
  // Click-through: a screen may call `onNavigate('pick')` from a button's
  // onClick to move the canvas to another screen of the same variant. Optional:
  // most transitions are wired from the config instead (`flow.transitions` with
  // a `target`), so variant screens don't need to know about the canvas. It is
  // undefined in the contact sheet, where screens are not clicked through.
  onNavigate?: ((screen: string) => void) | undefined;
}

type ScreenComponent = ComponentType<ScreenProps>;

interface VariantMeta {
  // Short name shown in the top bar, e.g. "A · Two pots".
  title: string;
  // One line: the idea this variant bets on.
  summary: string;
}

// Each variants/<x>/index.tsx exports exactly this shape.
interface VariantModule<S extends string> {
  meta: VariantMeta;
  screens: Record<S, ScreenComponent>;
}

interface ExplorationScreen {
  label: string;
  // The user's job on this screen ("choose-asset", "review"). Today's steps
  // carry jobs too; the compare rail and strip match on it.
  job: string;
  // Shown when no step of today's flow does this job.
  notInToday?: string;
}

// A step of today's flow that a variant removes on purpose. The why is shown
// under the real screenshot, so nothing is dropped silently.
export interface TodayCut {
  step: string;
  why: string;
}

// A step of today's flow that a variant keeps as it is (no concept screen
// redraws it). Reads "Kept (unchanged)", or "Kept · <why>".
export interface TodayKept {
  step: string;
  why?: string;
}

// Click-through. A transition moves the single-screen view from one screen to
// another, the way a prototype link does. `trigger` is what the reviewer reads
// ("Tap the book icon"); `target` says which element in the rendered screen is
// the hotspot, so no variant code changes:
// - text: the visible text or aria-label of a button, link, tab, option or
//   other clickable element (case-insensitive, "contains").
// - selector: any CSS selector inside the frame, for elements without text.
// A transition with no target (or one whose target isn't on screen) is still
// listed under the frame as a button, so the flow can always be walked.
export interface HotspotTarget {
  text?: string;
  selector?: string;
}

export interface FlowTransition<S extends string> {
  from: S;
  to: S;
  trigger: string;
  target?: HotspotTarget;
}

// The flow a variant's screens make: their order, where it starts, and how
// one screen leads to the next. Shown in the left rail's screen list and used
// for click-through in the single-screen view.
interface ExplorationFlow<S extends string> {
  // Screen order in the rail and for ←/→; defaults to config.screenIds.
  order?: S[];
  // How the user reaches a screen from outside the flow, e.g.
  // { recipient: 'Home → Send → BTC' }. The first entry is the flow's start.
  entries?: Partial<Record<S, string>>;
  transitions?: FlowTransition<S>[];
}

interface ExplorationVariant<S extends string> {
  // Switcher label, e.g. "A".
  label: string;
  // Top-bar title; defaults to module.meta.title.
  title?: string;
  module: VariantModule<S>;
  // This variant gives a screen a different job than the default.
  jobs?: Partial<Record<S, string>>;
  // Which of today's flows ("Compare with today" beside a screen) to match this
  // variant's screens against: a `TodayFlow.id`, e.g. 'stx' for a concept that
  // sends STX, so the rail shows today's STX form rather than the BTC one.
  // Today's steps are still matched by job, searching this flow first; a job
  // this flow doesn't have (shared steps like choose-asset) falls back to the
  // other flows in order. Omitted: the first step in any flow that does the job.
  compareFlow?: string;
  cuts?: TodayCut[];
  // Steps this variant keeps unchanged (TodayStep.kept covers every variant).
  kept?: TodayKept[];
  // This variant's flow; each field overrides the area's `flow` (entries merge).
  flow?: ExplorationFlow<S>;
  // Reviewer notes for this variant only, listed above the area assumptions.
  notes?: string[];
}

export interface TodayStep {
  // Capture name, e.g. "btc-review".
  name: string;
  label: string;
  // Jobs this step does; a form can do "recipient" and "amount".
  jobs?: string[];
  // Popup-only screens have no tab capture.
  popupOnly?: boolean;
  // Not captured: render a placeholder instead of an image.
  missing?: boolean;
  // Short qualifier next to the label ("synthetic").
  note?: string;
  // Every variant keeps this step as it is: reads "Kept (unchanged)", or
  // "Kept · <why>" when a string. A variant's cut still wins.
  kept?: true | string;
}

export interface TodayFlow {
  id: string;
  label: string;
  caption: string;
  // Step number of the first step shown (a second flow can skip shared steps).
  startAt: number;
  steps: TodayStep[];
}

export interface TodayConfig {
  flows: TodayFlow[];
  image(name: string, frame: FrameId, theme: ThemeId): string;
  // Tab captures exist in light only.
  tabLightOnly?: boolean;
  // Cuts every variant shares (a variant adds its own in `cuts`).
  cuts?: TodayCut[];
}

// Where a concept line comes from. Only these five kinds:
// - notes: the variant's NOTES.md (or another file in the area).
// - brief: the issue or brief the exploration answers.
// - inspiration: the references / inspiration write-up.
// - baseline: today's flow and its known UX issues.
// - our read: an inference made while building, not in a source.
type ConceptSourceKind = 'notes' | 'brief' | 'inspiration' | 'baseline' | 'our read';
// A kind, optionally followed by a pointer: "brief §4", "baseline #3".
type ConceptSource = ConceptSourceKind | `${ConceptSourceKind} ${string}`;

export interface ConceptLine {
  text: string;
  source: ConceptSource;
}

export interface Concept {
  title: string;
  builtFrom: string[];
  bet: ConceptLine;
  why: ConceptLine[];
  tradeOff: ConceptLine;
  openQuestions: ConceptLine[];
}

export interface JourneyStep {
  label: string;
  lines: string[];
}

export interface Reference<S extends string> {
  app: string;
  // The image URL, usually a Vite import of a file in the area folder
  // (`import.meta.glob(…, { query: '?url' })`, see imageUrls). A bare file name
  // is resolved against references.path. Omitted for text-only sources.
  image?: string;
  // Landscape capture (desktop web): shown in a wider card.
  wide?: boolean;
  // One line: what we took, "source → our version".
  took: string;
  screens: S[];
}

interface ReferenceGroup<S extends string> {
  // Only set when a concept groups its references.
  label?: string;
  references: Reference<S>[];
}

export interface ExplorationConfig<V extends string, S extends string> {
  title: string;
  variantIds: readonly V[];
  screenIds: readonly S[];
  defaultVariant: V;
  defaultScreen: S;
  // The variant that redraws today's flow, if the area has one.
  baselineVariant?: V;
  // The canvas lists one Today, above the variants. Which one is the config's
  // call, and the more accurate one wins:
  // - 'recreated': the baselineVariant, once its screens passed the fidelity
  //   check (`pnpm design:fidelity`, side-by-sides in its NOTES.md). It clicks
  //   through like a concept; the real screenshots still back "Compare with
  //   today".
  // - 'screenshots' (default): the real captures in `today`. A baselineVariant
  //   that wasn't checked is then left out of the canvas, so there is never a
  //   second Today.
  todayEntry?: 'recreated' | 'screenshots';
  variants: Record<V, ExplorationVariant<S>>;
  screens: Record<S, ExplorationScreen>;
  today: TodayConfig;
  concepts: Record<V, Concept>;
  journey: JourneyStep[];
  // `path` is only needed when images are bare file names (e.g. under
  // apps/web/public/playground/<area>/).
  references: { path?: string; byVariant: Record<V, ReferenceGroup<S>[]> };
  // Reviewer notes, always listed in the right rail. Never inside a screen.
  assumptions?: string[];
  // The flow every variant shares unless it sets its own (variant.flow).
  flow?: ExplorationFlow<S>;
}

// Today is the recreated baseline variant (todayEntry: 'recreated').
export function recreatedToday<V extends string, S extends string>(
  config: ExplorationConfig<V, S>
): V | undefined {
  return config.todayEntry === 'recreated' ? config.baselineVariant : undefined;
}

// The concepts the canvas lists under Variants: every variant except the
// baseline (it is either the Today entry or left out).
export function conceptIds<V extends string, S extends string>(config: ExplorationConfig<V, S>) {
  return config.variantIds.filter(id => id !== config.baselineVariant);
}

export function screenJob<V extends string, S extends string>(
  config: ExplorationConfig<V, S>,
  variant: V,
  screen: S
) {
  return config.variants[variant].jobs?.[screen] ?? config.screens[screen].job;
}

export function todayCuts<V extends string, S extends string>(
  config: ExplorationConfig<V, S>,
  variant: V
) {
  return [...(config.today.cuts ?? []), ...(config.variants[variant].cuts ?? [])];
}

export function compareFlowId<V extends string, S extends string>(
  config: ExplorationConfig<V, S>,
  variant: V
) {
  return config.variants[variant].compareFlow;
}

export function todayKept<V extends string, S extends string>(
  config: ExplorationConfig<V, S>,
  variant: V
) {
  return config.variants[variant].kept ?? [];
}

export function variantTitle<V extends string, S extends string>(
  config: ExplorationConfig<V, S>,
  variant: V
) {
  const entry = config.variants[variant];
  return entry.title ?? entry.module.meta.title;
}

export interface ResolvedFlow<S extends string> {
  order: S[];
  entries: Partial<Record<S, string>>;
  transitions: FlowTransition<S>[];
}

// The selected variant's flow: its own fields over the area's.
export function variantFlow<V extends string, S extends string>(
  config: ExplorationConfig<V, S>,
  variant: V
): ResolvedFlow<S> {
  const area = config.flow ?? {};
  const own = config.variants[variant].flow ?? {};
  const order = own.order ?? area.order ?? [...config.screenIds];
  return {
    order: order.filter(screen => config.screenIds.includes(screen)),
    entries: { ...area.entries, ...own.entries },
    transitions: (own.transitions ?? area.transitions ?? []).filter(
      item => config.screenIds.includes(item.from) && config.screenIds.includes(item.to)
    ),
  };
}
