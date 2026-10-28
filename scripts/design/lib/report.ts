// Renders a PromoteResult as markdown (for humans) and a JSON summary (for the dock badge and tooling).
import path from 'node:path';

import type { PromoteResult } from './analyze.ts';
import { thresholds } from './components.ts';

const cell = (value: unknown) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
const code = (value: string) => `\`${value.replace(/`/g, "'")}\``;

function table(head: string[], rows: unknown[][]): string {
  if (rows.length === 0) return '_None._';
  return [
    `| ${head.join(' | ')} |`,
    `| ${head.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${row.map(cell).join(' | ')} |`),
  ].join('\n');
}

export function renderMarkdown(result: PromoteResult): string {
  const base = result.files.length === 1 ? path.dirname(result.files[0]) : result.input;
  const where = (file: string, line: number) =>
    `${path.relative(base, file) || path.basename(file)}:${line}`;
  const byLocation = <T extends { file: string; line: number }>(list: T[]) =>
    [...list].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
  const { scan, drift } = result;
  const out: string[] = [];

  out.push(`# Promote report: ${result.input}`);
  out.push(
    [
      `Generated ${result.generatedAt.slice(0, 16).replace('T', ' ')} UTC from ${result.files.length} file(s).`,
      `System values: ${result.systemSource}.`,
      result.included.length
        ? `Also scanned: ${result.included.map(code).join(', ')} (the area's shared pieces).`
        : '',
      `DEVIATIONS.md: ${result.deviationsFiles.length ? `${result.deviationsFiles.map(code).join(', ')} (each row is checked against the nearest one above its file)` : 'not found (every deviation counts as undocumented)'}.`,
    ]
      .filter(Boolean)
      .join(' ')
  );
  out.push(`**${drift.line}**`);
  out.push(
    '> Verdicts are proposals. Colours use CIEDE2000 against the semantic token values (≤2 same, ≤6 close, >6 new). ' +
      'Sizes use the spacing, radius, size and text-style scales (0px same, ≤2px close, more is off-scale). ' +
      'Component matches are heuristic; read the scores and reasons before acting.'
  );
  if (scan.parseErrors.length) {
    out.push(
      `**Could not parse:** ${scan.parseErrors.map(error => `${error.file} (${error.message})`).join('; ')}`
    );
  }

  // 1
  out.push('## 1. Raw values → nearest token');
  out.push('### Colours');
  out.push(
    table(
      ['Where', 'Literal', 'Prop', 'Mode', 'Nearest token', 'ΔE00', 'Verdict'],
      byLocation(scan.colours).map(colour => [
        where(colour.file, colour.line),
        code(colour.literal),
        colour.property ?? '',
        colour.mode,
        [
          `${code(colour.token)} ${colour.tokenValue}`,
          colour.sameValueTokens.length ? `(same value: ${colour.sameValueTokens.join(', ')})` : '',
          colour.alternatives.length
            ? `· next: ${colour.alternatives.map(alt => `${alt.token} ${alt.deltaE}`).join(', ')}`
            : '',
          colour.note ? `· ${colour.note}` : '',
          colour.pair
            ? `· as a light/dark pair (${colour.pair.light} / ${colour.pair.dark}): ${code(colour.pair.token)} ΔE ${colour.pair.lightDeltaE} / ${colour.pair.darkDeltaE}, ${colour.pair.verdict}`
            : '',
        ]
          .filter(Boolean)
          .join(' '),
        colour.deltaE,
        colour.verdict,
      ])
    )
  );
  out.push('### Sizes');
  out.push(
    table(
      ['Where', 'Literal', 'Prop', 'Scale', 'Nearest token', 'Diff', 'Verdict'],
      byLocation(scan.sizes).map(size => [
        where(size.file, size.line),
        code(size.literal),
        size.property,
        size.group,
        `${code(size.token)} (${size.tokenPx}px)${size.ties.length ? ` or ${size.ties.join(', ')}` : ''}`,
        `${size.diffPx > 0 ? '+' : ''}${size.diffPx}px`,
        size.verdict,
      ])
    )
  );

  // 2
  out.push('## 2. Undefined tokens and text styles');
  out.push(
    'Panda does not type-check these while strictTokens is off: an undefined name silently renders the browser default. These are bugs, not deviations.'
  );
  out.push(
    table(
      ['Where', 'Kind', 'Value', 'Prop', 'Defined alternatives'],
      byLocation(scan.tokens).map(token => [
        where(token.file, token.line),
        token.tokenKind,
        code(token.value),
        token.property,
        token.suggestion,
      ])
    )
  );

  // 3
  out.push('## 3. Components defined here');
  out.push(
    `A proposal for a human to decide. Score = 0.35 name + 0.25 props + 0.25 structure + 0.15 meta; a match needs ≥ ${thresholds.match}. ` +
      'Props come from the TypeScript prop types (syntax only); structure from what the component renders; meta from packages/ui/**/*.meta.shared.ts (useWhen, dontUseWhen, replaces).'
  );
  const assessed = result.components.filter(
    assessment => assessment.verdict.kind !== 'scaffolding'
  );
  const scaffolding = result.components.filter(
    assessment => assessment.verdict.kind === 'scaffolding'
  );
  if (assessed.length === 0) out.push('_No components defined outside page scaffolding._');
  for (const { component, candidates, verdict, evidence } of assessed) {
    out.push(`### ${code(component.name)}: ${verdict.text}`);
    out.push(
      [
        `${code(where(component.file, component.line))}`,
        `props: ${component.props.length ? component.props.join(', ') : '—'}${component.inherits.length ? ` (inherits ${component.inherits.join(', ')})` : ''}`,
        `base element: ${component.baseElement ?? '—'}`,
        `renders: ${component.renders.slice(0, 8).join(', ') || '—'}`,
      ].join(' · ')
    );
    out.push(
      table(
        ['Candidate', 'Score', 'Name', 'Props', 'Structure', 'Meta', 'Reasons'],
        candidates.map(candidate => [
          candidate.ui,
          candidate.total,
          candidate.scores.name,
          candidate.scores.props,
          candidate.scores.structure,
          candidate.scores.meta,
          candidate.reasons.join('; ') || '—',
        ])
      )
    );
    const best = candidates[0];
    const lines: string[] = [];
    if (best && verdict.kind !== 'new' && best.coverage.length) {
      lines.push(
        `Prop coverage on ${best.ui}: ${best.coverage.map(entry => `${entry.prop} (${entry.how})`).join(', ')}`
      );
    }
    lines.push(...evidence);
    if (verdict.kind === 'new') {
      lines.push(
        'If it is promoted: add `<name>.meta.shared.ts` (useWhen, dontUseWhen, replaces, examples) next to the component in packages/ui, and an entry in the Playground component gallery.'
      );
    }
    if (verdict.kind === 'extend') {
      lines.push(
        `Before extending, check whether ${verdict.props.join(', ')} can be expressed with what ${verdict.ui} already has; if not, add the prop(s) to ${verdict.ui} and its meta file.`
      );
    }
    if (lines.length) out.push(lines.map(line => `- ${line}`).join('\n'));
  }
  if (scaffolding.length) {
    out.push(
      `_Not assessed (page scaffolding or providers only): ${scaffolding.map(entry => entry.component.name).join(', ')}._`
    );
  }

  // 4
  out.push('## 4. Local primitives and duplicates');
  out.push(
    'Same rules as `eslint.design.config.js` (eslint-rules/design-system), plus local files named like a @leather.io/ui component.'
  );
  out.push(
    table(
      ['Where', 'Construct', 'Rule', 'Use instead'],
      byLocation(scan.guardrails).map(hit => [
        where(hit.file, hit.line),
        code(hit.construct),
        hit.rule,
        hit.message.replace(/ — (docs\/design\/never\.md#.*)$/, ' ($1)'),
      ])
    )
  );

  out.push('### Restyled @leather.io/ui components');
  out.push(
    'Style props on a ui component change how the shipped component looks (a Caption lighter than in the product, a smaller Button, a bigger icon). ' +
      'Keep the default, or give a why in DEVIATIONS.md keyed `Component.prop`. Any change from shipped UI needs a reason.'
  );
  out.push(
    table(
      ['Where', 'Component', 'Prop', 'Value', 'Key'],
      byLocation(scan.overrides).map(override => [
        where(override.file, override.line),
        code(`<${override.component}>`),
        override.prop,
        code(override.value),
        code(`${override.component}.${override.prop}`),
      ])
    )
  );

  // 5
  out.push('## 5. Deviation ledger');
  out.push(
    'Every deviation still in the code. Action: swap = mechanical token swap; decide = keep with a reason or swap; fix = undefined token; ' +
      'reuse/extend/new/replace = component work. Anything that ships needs a why in DEVIATIONS.md (key = the Key column).'
  );
  out.push(
    table(
      ['ID', 'Category', 'Where', 'Deviation', 'Key', 'Suggestion', 'Action', 'Why', 'Status'],
      result.ledger.map(row => [
        row.id,
        row.category,
        where(row.where.replace(/:\d+$/, ''), Number(row.where.split(':').pop())),
        row.deviation,
        code(row.key),
        row.suggestion,
        row.action,
        row.why,
        row.status,
      ])
    )
  );
  const undocumented = result.ledger.filter(row => row.status === 'undocumented');
  const checks: string[] = [];
  checks.push(
    result.deviationsFiles.length
      ? `DEVIATIONS.md check: ${result.ledger.filter(row => row.status === 'documented').length} documented, ${undocumented.length} undocumented, ${result.stale.length} stale.`
      : `No DEVIATIONS.md: all ${undocumented.length} deviations are undocumented.`
  );
  for (const entry of result.stale) {
    checks.push(
      `- stale: ${code(entry.key)} (${entry.file ?? 'DEVIATIONS.md'}:${entry.line}) has a reason but no matching deviation in the code. Remove it.`
    );
  }
  out.push(checks.join('\n'));
  if (undocumented.length) {
    out.push('Starter rows for DEVIATIONS.md (fill the why, or fix the code and drop the row):');
    const seen = new Set<string>();
    const rows = undocumented.filter(row => !seen.has(row.key) && seen.add(row.key));
    out.push(
      [
        '```md',
        '| Deviation | Where | Why |',
        '| --- | --- | --- |',
        ...rows.map(
          row =>
            `| \`${row.key}\` | ${where(row.where.replace(/:\d+$/, ''), Number(row.where.split(':').pop()))} | |`
        ),
        '```',
      ].join('\n')
    );
  }

  // 6
  out.push('## 6. Drift score');
  out.push(`${code(drift.badge)}\n\n${drift.line}`);
  return `${out.join('\n\n')}\n`;
}

export function jsonSummary(result: PromoteResult) {
  return {
    input: result.input,
    generatedAt: result.generatedAt,
    systemSource: result.systemSource,
    files: result.files,
    drift: result.drift,
    components: result.components.map(({ component, verdict, candidates, evidence }) => ({
      name: component.name,
      where: `${component.file}:${component.line}`,
      verdict: verdict.text,
      kind: verdict.kind,
      best: candidates[0]
        ? { ui: candidates[0].ui, score: candidates[0].total, scores: candidates[0].scores }
        : null,
      evidence,
    })),
    colours: result.scan.colours,
    sizes: result.scan.sizes,
    tokens: result.scan.tokens,
    guardrails: result.scan.guardrails,
    overrides: result.scan.overrides,
    ledger: result.ledger,
    stale: result.stale,
    deviationsFile: result.deviationsFile,
    deviationsFiles: result.deviationsFiles,
    included: result.included,
  };
}
