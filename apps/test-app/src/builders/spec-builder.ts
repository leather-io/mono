// Describing a family of requests as choices rather than as entries.
//
// Some parts of the catalog are a PRODUCT of independent options — a PSBT is
// an input set × a count × a sighash flag × outputs × request flags — and
// listing every point of that product buries the handful of genuinely distinct
// tests under dozens of near-identical ones. Such a family is declared once as
// a field list plus a `build` function; the UI renders the fields, and a spec
// exists only when somebody picks a combination.
//
// The id is still the addressing scheme: it encodes exactly the fields that
// differ from the defaults, so `psbt.inputs_p2tr.sighash_single` round-trips
// back to a selection and `findSpec` can rebuild the request from it.
//
// This is for genuine products only. Distinct methods and distinct flows stay
// listed — a dropdown hides them instead of simplifying them.
//
// Pure: no React, no `window`.
import type { RpcCategory, RpcMethodSpec } from '../types';

export type BuilderFieldValue = string | number | boolean;
export type BuilderSelection = Record<string, BuilderFieldValue>;

export interface BuilderOption {
  value: BuilderFieldValue;
  label: string;
  /** Token used in the generated id; defaults to `String(value)`. */
  slug?: string;
}

export interface BuilderField {
  key: string;
  label: string;
  /** Options may depend on the selection — DEFAULT is a taproot-only flag. */
  options(selection: BuilderSelection): BuilderOption[];
  /** Fields that do not apply to the current selection are hidden and reset. */
  visibleWhen?(selection: BuilderSelection): boolean;
}

export interface SpecBuilder {
  id: string;
  label: string;
  description: string;
  category: RpcCategory;
  fields: BuilderField[];
  defaults: BuilderSelection;
  build(selection: BuilderSelection): RpcMethodSpec;
  /**
   * A CURATED sweep, never the full cross product: the PSBT space runs to
   * thousands of points, and each one is a wallet prompt.
   */
  combinations(): BuilderSelection[];
  /** Ids from an older scheme this builder should still answer to. */
  parseLegacyId?(id: string): BuilderSelection | undefined;
}

function slugOf(option: BuilderOption): string {
  return option.slug ?? String(option.value);
}

/**
 * Fill in defaults, drop fields that do not apply, and replace any value that
 * is no longer among its options — so switching input kind cannot leave a
 * taproot-only flag selected.
 */
export function normalizeSelection(
  builder: SpecBuilder,
  partial: Partial<BuilderSelection>
): BuilderSelection {
  // Spreading a Partial would widen every value with `undefined`; an explicit
  // copy keeps the selection total.
  const selection: BuilderSelection = { ...builder.defaults };
  for (const [key, value] of Object.entries(partial)) {
    if (value !== undefined) selection[key] = value;
  }
  for (const field of builder.fields) {
    const fallback = builder.defaults[field.key] ?? field.options(selection)[0]?.value ?? '';
    if (field.visibleWhen && !field.visibleWhen(selection)) {
      selection[field.key] = fallback;
      continue;
    }
    const options = field.options(selection);
    if (!options.some(option => option.value === selection[field.key]))
      selection[field.key] = options[0]?.value ?? fallback;
  }
  return selection;
}

/** Fields the UI should show for this selection, with their options. */
export function visibleFields(
  builder: SpecBuilder,
  selection: BuilderSelection
): { field: BuilderField; options: BuilderOption[] }[] {
  return builder.fields
    .filter(field => !field.visibleWhen || field.visibleWhen(selection))
    .map(field => ({ field, options: field.options(selection) }));
}

// `.` separates fields and `_` separates a key from its value, so values may
// contain hyphens (`wsh-pk`, `single-acp`) without becoming ambiguous.
const fieldSeparator = '.';
const valueSeparator = '_';

/** Id encoding only what differs from the defaults. */
export function builderSpecId(builder: SpecBuilder, selection: BuilderSelection): string {
  const parts = builder.fields
    .filter(field => !field.visibleWhen || field.visibleWhen(selection))
    .filter(field => selection[field.key] !== builder.defaults[field.key])
    .map(field => {
      const option = field
        .options(selection)
        .find(candidate => candidate.value === selection[field.key]);
      return `${field.key}${valueSeparator}${option ? slugOf(option) : String(selection[field.key])}`;
    });
  return [builder.id, ...parts].join(fieldSeparator);
}

/** The inverse; undefined when `id` is not this builder's. */
export function parseBuilderSpecId(builder: SpecBuilder, id: string): BuilderSelection | undefined {
  const [head, ...parts] = id.split(fieldSeparator);
  if (head !== builder.id) return builder.parseLegacyId?.(id);

  const selection: BuilderSelection = { ...builder.defaults };
  for (const part of parts) {
    const separator = part.indexOf(valueSeparator);
    if (separator === -1) return undefined;
    const key = part.slice(0, separator);
    const slug = part.slice(separator + 1);
    const field = builder.fields.find(candidate => candidate.key === key);
    if (!field) return undefined;
    const option = field.options(selection).find(candidate => slugOf(candidate) === slug);
    if (!option) return undefined;
    selection[key] = option.value;
  }
  return normalizeSelection(builder, selection);
}

/** Build the spec for a selection, normalizing it first. */
export function buildFromSelection(
  builder: SpecBuilder,
  partial: Partial<BuilderSelection>
): RpcMethodSpec {
  return builder.build(normalizeSelection(builder, partial));
}
