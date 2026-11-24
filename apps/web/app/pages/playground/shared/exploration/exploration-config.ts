import type { ComponentType } from 'react';

import type { FrameId, ThemeId } from './frame';

export interface ScreenProps {
  frame: FrameId;
  theme: ThemeId;
  onNavigate?: ((screen: string) => void) | undefined;
}

type ScreenComponent = ComponentType<ScreenProps>;

interface VariantMeta {
  title: string;
  summary: string;
}

interface VariantModule<S extends string> {
  meta: VariantMeta;
  screens: Record<S, ScreenComponent>;
}

interface ExplorationScreen {
  label: string;
  job: string;
  notInToday?: string;
}

export interface TodayCut {
  step: string;
  why: string;
}

export interface TodayKept {
  step: string;
  why?: string;
}

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

interface ExplorationFlow<S extends string> {
  order?: S[];
  entries?: Partial<Record<S, string>>;
  transitions?: FlowTransition<S>[];
}

interface ExplorationVariant<S extends string> {
  label: string;
  title?: string;
  module: VariantModule<S>;
  jobs?: Partial<Record<S, string>>;
  compareFlow?: string;
  cuts?: TodayCut[];
  kept?: TodayKept[];
  flow?: ExplorationFlow<S>;
  notes?: string[];
}

export interface TodayStep {
  name: string;
  label: string;
  jobs?: string[];
  popupOnly?: boolean;
  missing?: boolean;
  note?: string;
  kept?: true | string;
}

export interface TodayFlow {
  id: string;
  label: string;
  caption: string;
  startAt: number;
  steps: TodayStep[];
}

export interface TodayConfig {
  flows: TodayFlow[];
  image(name: string, frame: FrameId, theme: ThemeId): string;
  tabLightOnly?: boolean;
  cuts?: TodayCut[];
}

type ConceptSourceKind = 'notes' | 'brief' | 'inspiration' | 'baseline' | 'our read';
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
  image?: string;
  wide?: boolean;
  took: string;
  screens: S[];
}

interface ReferenceGroup<S extends string> {
  label?: string;
  references: Reference<S>[];
}

export interface ExplorationConfig<V extends string, S extends string> {
  title: string;
  variantIds: readonly V[];
  screenIds: readonly S[];
  defaultVariant: V;
  defaultScreen: S;
  baselineVariant?: V;
  todayEntry?: 'recreated' | 'screenshots';
  variants: Record<V, ExplorationVariant<S>>;
  screens: Record<S, ExplorationScreen>;
  today: TodayConfig;
  concepts: Record<V, Concept>;
  journey: JourneyStep[];
  references: { path?: string; byVariant: Record<V, ReferenceGroup<S>[]> };
  assumptions?: string[];
  flow?: ExplorationFlow<S>;
}

export function recreatedToday<V extends string, S extends string>(
  config: ExplorationConfig<V, S>
): V | undefined {
  return config.todayEntry === 'recreated' ? config.baselineVariant : undefined;
}

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
