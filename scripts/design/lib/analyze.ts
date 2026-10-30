import { existsSync, globSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

import { parseColour, toHex } from './colour.ts';
import {
  type ComponentAssessment,
  assessComponent,
  componentsInFile,
  loadUiCatalog,
} from './components.ts';
import { type ScanResult, scanFile } from './scan.ts';
import { type DesignSystem, loadDesignSystem, repoRoot } from './system.ts';

type LedgerCategory = 'colour' | 'size' | 'token' | 'component' | 'primitive' | 'override';
type LedgerAction = 'swap' | 'decide' | 'fix' | 'reuse' | 'extend' | 'new' | 'replace';
type LedgerStatus = 'documented' | 'undocumented' | 'n/a (must fix)';

interface LedgerRow {
  id: string;
  category: LedgerCategory;
  where: string;
  deviation: string;
  key: string;
  suggestion: string;
  action: LedgerAction;
  why: string;
  status: LedgerStatus;
}

interface DeviationEntry {
  key: string;
  why: string;
  line: number;
  // The DEVIATIONS.md it came from (repo-relative); set by analyze.
  file?: string;
}

interface DriftScore {
  total: number;
  counts: Record<LedgerCategory, number>;
  undocumented: number;
  stale: number;
  badge: string;
  line: string;
}

export interface PromoteResult {
  input: string;
  generatedAt: string;
  systemSource: string;
  files: string[];
  scan: ScanResult;
  components: ComponentAssessment[];
  ledger: LedgerRow[];
  // The input folder's own DEVIATIONS.md, if any.
  deviationsFile: string | null;
  // Every DEVIATIONS.md read: one per folder that has one. A row is checked
  // against the nearest one above its file.
  deviationsFiles: string[];
  // Folders scanned besides the input: the area's shared/ for a variant.
  included: string[];
  stale: DeviationEntry[];
  drift: DriftScore;
}

const rel = (file: string) => path.relative(repoRoot, file) || file;

function sourceFiles(input: string): string[] {
  if (statSync(input).isFile()) return [input];
  return globSync('**/*.{ts,tsx}', { cwd: input })
    .filter(file => !/\.(spec|test|d)\.tsx?$/.test(file) && !file.includes('node_modules'))
    .sort()
    .map(file => path.join(input, file));
}

// A variant folder (<area>/variants/<x>) also gets the area's shared/ folder,
// so a deviation moved into shared/ still shows in every variant's report.
function includedFolders(input: string): string[] {
  if (!statSync(input).isDirectory()) return [];
  const variants = path.dirname(input);
  if (path.basename(variants) !== 'variants') return [];
  const shared = path.join(path.dirname(variants), 'shared');
  return existsSync(shared) && statSync(shared).isDirectory() ? [shared] : [];
}

// Every DEVIATIONS.md under the scanned folders, by folder.
function deviationFiles(roots: string[]): Map<string, string> {
  const byFolder = new Map<string, string>();
  for (const root of roots) {
    if (!statSync(root).isDirectory()) continue;
    for (const file of globSync('**/DEVIATIONS.md', { cwd: root })) {
      if (file.includes('node_modules')) continue;
      const absolute = path.join(root, file);
      byFolder.set(path.dirname(absolute), absolute);
    }
  }
  return byFolder;
}

// The nearest DEVIATIONS.md at or above `file`, without leaving its root.
function nearestDeviations(file: string, roots: string[], byFolder: Map<string, string>) {
  const root = roots.find(candidate => file === candidate || file.startsWith(candidate + path.sep));
  if (!root) return undefined;
  for (let folder = path.dirname(file); ; folder = path.dirname(folder)) {
    const found = byFolder.get(folder);
    if (found) return found;
    if (folder === root || folder === path.dirname(folder)) return undefined;
  }
}

// DEVIATIONS.md: a table (first column = deviation, last column = why) or a
// bullet list (`- \`key\` — why`). The key is the literal, token, import,
// construct or component name exactly as the report prints it.
export function parseDeviations(text: string): DeviationEntry[] {
  const entries: DeviationEntry[] = [];
  const lines = text.split('\n');
  let tableHeader = true;
  lines.forEach((raw, index) => {
    const line = raw.trim();
    if (line.startsWith('|')) {
      const cells = line
        .replace(/^\||\|$/g, '')
        .split('|')
        .map(cell => cell.trim());
      if (cells.every(cell => /^:?-{2,}:?$/.test(cell))) {
        tableHeader = false;
        return;
      }
      if (tableHeader) return;
      const key = (/`([^`]+)`/.exec(cells[0])?.[1] ?? cells[0]).trim();
      if (key)
        entries.push({
          key,
          why: cells.length > 1 ? cells[cells.length - 1] : '',
          line: index + 1,
        });
      return;
    }
    tableHeader = true;
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (!bullet) return;
    const body = bullet[1];
    const coded = /^`([^`]+)`\s*(?:\([^)]*\))?\s*(?:[—–:-]\s*)?(.*)$/.exec(body);
    if (coded) entries.push({ key: coded[1].trim(), why: coded[2].trim(), line: index + 1 });
    else {
      const plain = /^([^:—–]+?)\s*[:—–]\s*(.*)$/.exec(body);
      if (plain) entries.push({ key: plain[1].trim(), why: plain[2].trim(), line: index + 1 });
    }
  });
  return entries;
}

function normaliseKey(key: string): string {
  const trimmed = key.trim();
  const colour = /^#|^(rgb|hsl)a?\(/i.test(trimmed) ? parseColour(trimmed) : null;
  return colour ? toHex(colour) : trimmed.toLowerCase().replace(/\s+/g, '');
}

const isPlaceholder = (why: string) => /^(|-|—|\?|todo|tbd|n\/a)$/i.test(why.trim());

function buildLedger(scan: ScanResult, components: ComponentAssessment[]): LedgerRow[] {
  const rows: Omit<LedgerRow, 'id' | 'why' | 'status'>[] = [];
  for (const colour of scan.colours) {
    rows.push({
      category: 'colour',
      where: `${colour.file}:${colour.line}`,
      deviation: `${colour.literal}${colour.property ? ` (${colour.property})` : ''}`,
      key: colour.literal,
      suggestion: `${colour.token} ΔE ${colour.deltaE}`,
      action: colour.verdict.startsWith('same') ? 'swap' : 'decide',
    });
  }
  for (const size of scan.sizes) {
    rows.push({
      category: 'size',
      where: `${size.file}:${size.line}`,
      deviation: `${size.property}: ${size.literal}`,
      key: size.literal,
      suggestion: `${size.token} (${size.diffPx > 0 ? '+' : ''}${size.diffPx}px)`,
      action: size.verdict.startsWith('same') ? 'swap' : 'decide',
    });
  }
  for (const token of scan.tokens) {
    rows.push({
      category: 'token',
      where: `${token.file}:${token.line}`,
      deviation: `${token.tokenKind} ${token.value}`,
      key: token.value,
      suggestion: token.suggestion,
      action: 'fix',
    });
  }
  for (const assessment of components) {
    const { verdict, component } = assessment;
    if (verdict.kind === 'scaffolding') continue;
    rows.push({
      category: 'component',
      where: `${component.file}:${component.line}`,
      deviation: `<${component.name}>`,
      key: component.name,
      suggestion: verdict.text,
      action: verdict.kind,
    });
  }
  for (const override of scan.overrides) {
    rows.push({
      category: 'override',
      where: `${override.file}:${override.line}`,
      deviation: `<${override.component} ${override.prop}=${override.value}>`,
      key: `${override.component}.${override.prop}`,
      suggestion: `Restyles the shipped ${override.component}. Keep its default, or say why in DEVIATIONS.md`,
      action: 'decide',
    });
  }
  for (const hit of scan.guardrails) {
    rows.push({
      category: 'primitive',
      where: `${hit.file}:${hit.line}`,
      deviation: `${hit.construct} (${hit.rule})`,
      key: hit.construct,
      suggestion: hit.message.replace(/ — docs\/design\/never\.md#.*$/, ''),
      action: 'replace',
    });
  }
  return rows.map((row, index) => ({
    ...row,
    id: `D${index + 1}`,
    why: '',
    status: 'undocumented',
  }));
}

function applyDeviations(ledger: LedgerRow[], entries: DeviationEntry[]): DeviationEntry[] {
  const used = new Set<DeviationEntry>();
  for (const row of ledger) {
    if (row.action === 'fix') {
      row.status = 'n/a (must fix)';
      row.why = 'n/a — undefined token, fix it';
      continue;
    }
    const entry = entries.find(candidate => normaliseKey(candidate.key) === normaliseKey(row.key));
    if (!entry) continue;
    used.add(entry);
    if (!isPlaceholder(entry.why)) {
      row.why = entry.why;
      row.status = 'documented';
    }
  }
  return entries.filter(entry => !used.has(entry));
}

function driftScore(ledger: LedgerRow[], stale: number): DriftScore {
  const counts: Record<LedgerCategory, number> = {
    colour: 0,
    size: 0,
    token: 0,
    component: 0,
    primitive: 0,
    override: 0,
  };
  for (const row of ledger) counts[row.category]++;
  const total = ledger.length;
  const undocumented = ledger.filter(row => row.status === 'undocumented').length;
  const parts = Object.entries(counts).map(([category, count]) => `${category} ${count}`);
  return {
    total,
    counts,
    undocumented,
    stale,
    badge: `drift ${total} · ${undocumented} undocumented${stale ? ` · ${stale} stale` : ''}`,
    line: `drift ${total} — ${parts.join(' · ')} — ${undocumented} undocumented, ${stale} stale`,
  };
}

export async function analyze(
  input: string,
  options: { systemJson?: string } = {}
): Promise<PromoteResult> {
  const absolute = path.resolve(input);
  if (!existsSync(absolute)) throw new Error(`No such path: ${input}`);
  const system: DesignSystem = await loadDesignSystem(options.systemJson);
  const catalog = loadUiCatalog();
  const included = includedFolders(absolute);
  const roots = [absolute, ...included];
  const files = roots.flatMap(sourceFiles);
  const scan: ScanResult = {
    colours: [],
    sizes: [],
    tokens: [],
    guardrails: [],
    overrides: [],
    parseErrors: [],
  };
  const components: ComponentAssessment[] = [];
  const uiNames = new Set(catalog.exports);
  for (const file of files) {
    const display = rel(file);
    scanFile(display, readFileSync(file, 'utf8'), system, catalog.exports, scan, [
      ...catalog.exports,
      ...catalog.icons,
    ]);
    if (!file.endsWith('.tsx')) continue;
    for (const component of componentsInFile(file, display)) {
      const assessment = assessComponent(component, catalog, system.radii);
      components.push(assessment);
      if (uiNames.has(component.name)) {
        scan.guardrails.push({
          kind: 'guardrail',
          file: display,
          line: component.line,
          column: 1,
          rule: 'local-redefinition',
          construct: component.name,
          message: `Local component named ${component.name} shadows ${component.name} from @leather.io/ui`,
        });
      }
    }
  }
  const ledger = buildLedger(scan, components);
  // Each row is checked against the nearest DEVIATIONS.md above its file
  // (variants/a/DEVIATIONS.md, shared/DEVIATIONS.md, <area>/DEVIATIONS.md).
  const byFolder = deviationFiles(roots);
  const rowsByFile = new Map<string | undefined, LedgerRow[]>();
  for (const row of ledger) {
    const file = path.join(repoRoot, row.where.replace(/:\d+$/, ''));
    const deviations = nearestDeviations(file, roots, byFolder);
    rowsByFile.set(deviations, [...(rowsByFile.get(deviations) ?? []), row]);
  }
  const stale: DeviationEntry[] = [];
  for (const deviations of [...new Set(byFolder.values())].sort()) {
    const entries = parseDeviations(readFileSync(deviations, 'utf8')).map(entry => ({
      ...entry,
      file: rel(deviations),
    }));
    stale.push(...applyDeviations(rowsByFile.get(deviations) ?? [], entries));
  }
  applyDeviations(rowsByFile.get(undefined) ?? [], []);
  const ownDeviations = path.join(absolute, 'DEVIATIONS.md');
  return {
    input: rel(absolute),
    generatedAt: new Date().toISOString(),
    systemSource: system.source,
    files: files.map(rel),
    scan,
    components,
    ledger,
    deviationsFile: byFolder.has(absolute) ? rel(ownDeviations) : null,
    deviationsFiles: [...new Set(byFolder.values())].sort().map(rel),
    included: included.map(rel),
    stale,
    drift: driftScore(ledger, stale.length),
  };
}
