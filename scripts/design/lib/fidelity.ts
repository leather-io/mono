// Compares a recreated "today" screen with the baseline screenshot of the real
// extension: a pixel diff, plus a structural diff of horizontal content bands
// (each run of rows with ink in it: a header, a button row, a tab bar, a list
// row). Bands catch what a pixel ratio hides: a button 12px shorter, tabs that
// stop 20px short of the edge, a block that is missing.
import { type Image, blankImage, blit, resize } from './png.ts';

interface Band {
  top: number;
  height: number;
  left: number;
  right: number;
}

interface BandFinding {
  index: number;
  baseline: Band | null;
  recreated: Band | null;
  notes: string[];
}

interface FidelityResult {
  width: number;
  height: number;
  differingPixels: number;
  ratio: number;
  bbox: { left: number; top: number; right: number; bottom: number } | null;
  baselineBands: Band[];
  recreatedBands: Band[];
  findings: BandFinding[];
  composite: Image;
}

const pixelThreshold = 40;
const inkThreshold = 28;
const tolerance = 3;

function delta(a: Uint8Array, i: number, b: Uint8Array, j: number) {
  return Math.max(
    Math.abs(a[i] - b[j]),
    Math.abs(a[i + 1] - b[j + 1]),
    Math.abs(a[i + 2] - b[j + 2])
  );
}

// The most common colour: the page background.
function backgroundOf(image: Image): Uint8Array {
  const counts = new Map<number, number>();
  for (let i = 0; i < image.data.length; i += 16) {
    const key = (image.data[i] << 16) | (image.data[i + 1] << 8) | image.data[i + 2];
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const [key] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return new Uint8Array([(key >> 16) & 255, (key >> 8) & 255, key & 255, 255]);
}

// Runs of rows that hold ink (pixels away from the background), merged across
// gaps of `gap` rows or fewer (so a pill button's border, label and border are
// one block), with their horizontal extent. The outer `edge` pixels are skipped:
// a frame's 1px border would otherwise join every row into one block.
export function bandsOf(image: Image, gap = 8, edge = 2): Band[] {
  const background = backgroundOf(image);
  const bands: Band[] = [];
  let current: Band | null = null;
  let blank = 0;
  for (let y = edge; y < image.height - edge; y++) {
    let left = -1;
    let right = -1;
    for (let x = edge; x < image.width - edge; x++) {
      if (delta(image.data, (y * image.width + x) * 4, background, 0) > inkThreshold) {
        if (left < 0) left = x;
        right = x;
      }
    }
    if (left >= 0) {
      if (current && blank <= gap) {
        current.height = y - current.top + 1;
        current.left = Math.min(current.left, left);
        current.right = Math.max(current.right, right);
      } else {
        current = { top: y, height: 1, left, right };
        bands.push(current);
      }
      blank = 0;
    } else blank++;
  }
  // Ignore specks (anti-aliasing, 1–2px rules count only when wide).
  return bands.filter(band => band.height > 2 || band.right - band.left > image.width / 2);
}

function describe(band: Band) {
  return `y ${band.top}, h ${band.height}, x ${band.left}–${band.right}`;
}

// How unlike two blocks are, in px. Position counts less than shape: a block
// that moved because something above it changed is still the same block.
function bandCost(a: Band, b: Band) {
  return (
    Math.abs(a.height - b.height) +
    Math.abs(a.left - b.left) +
    Math.abs(a.right - b.right) +
    0.25 * Math.abs(a.top - b.top)
  );
}

const gapCost = 60;

function notesFor(a: Band, b: Band) {
  const notes: string[] = [];
  const dh = b.height - a.height;
  const dy = b.top - a.top;
  const dl = b.left - a.left;
  const dr = b.right - a.right;
  if (Math.abs(dh) > tolerance) notes.push(`height ${dh > 0 ? '+' : ''}${dh}px`);
  if (Math.abs(dl) > tolerance) notes.push(`left edge ${dl > 0 ? '+' : ''}${dl}px`);
  if (Math.abs(dr) > tolerance) notes.push(`right edge ${dr > 0 ? '+' : ''}${dr}px`);
  if (Math.abs(dy) > 2 * tolerance) notes.push(`starts ${dy > 0 ? '+' : ''}${dy}px`);
  return notes;
}

// Aligns the two block lists (edit distance: match, missing, extra), so one
// missing banner doesn't shift every block after it.
export function compareBands(baseline: Band[], recreated: Band[]): BandFinding[] {
  const n = baseline.length;
  const m = recreated.length;
  const cost: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = 1; i <= n; i++) cost[i][0] = i * gapCost;
  for (let j = 1; j <= m; j++) cost[0][j] = j * gapCost;
  for (let i = 1; i <= n; i++)
    for (let j = 1; j <= m; j++)
      cost[i][j] = Math.min(
        cost[i - 1][j - 1] + bandCost(baseline[i - 1], recreated[j - 1]),
        cost[i - 1][j] + gapCost,
        cost[i][j - 1] + gapCost
      );
  const pairs: [Band | null, Band | null][] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (
      i > 0 &&
      j > 0 &&
      cost[i][j] === cost[i - 1][j - 1] + bandCost(baseline[i - 1], recreated[j - 1])
    ) {
      pairs.unshift([baseline[i - 1], recreated[j - 1]]);
      i--;
      j--;
    } else if (i > 0 && cost[i][j] === cost[i - 1][j] + gapCost) {
      pairs.unshift([baseline[i - 1], null]);
      i--;
    } else {
      pairs.unshift([null, recreated[j - 1]]);
      j--;
    }
  }
  return pairs.map(([a, b], index) => ({
    index: index + 1,
    baseline: a,
    recreated: b,
    notes: !a
      ? ['extra block in the recreation']
      : !b
        ? ['missing in the recreation']
        : notesFor(a, b),
  }));
}

export function compareImages(baseline: Image, recreatedRaw: Image): FidelityResult {
  // Scale the recreation to the baseline's width (a 390px frame against a 360px
  // capture), keep its aspect, and compare the rows both have.
  const scaledHeight = Math.round((recreatedRaw.height * baseline.width) / recreatedRaw.width);
  const recreated =
    recreatedRaw.width === baseline.width
      ? recreatedRaw
      : resize(recreatedRaw, baseline.width, scaledHeight);
  const width = baseline.width;
  const height = Math.min(baseline.height, recreated.height);
  const diff = blankImage(width, height);
  let differing = 0;
  let bbox: FidelityResult['bbox'] = null;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const changed = delta(baseline.data, i, recreated.data, i) > pixelThreshold;
      if (changed) {
        differing++;
        bbox = bbox
          ? {
              left: Math.min(bbox.left, x),
              top: Math.min(bbox.top, y),
              right: Math.max(bbox.right, x),
              bottom: Math.max(bbox.bottom, y),
            }
          : { left: x, top: y, right: x, bottom: y };
        diff.data.set([230, 40, 40, 255], i);
      } else {
        // The baseline, faded, so the red reads against it.
        const grey = 255 - Math.round((255 - baseline.data[i + 1]) * 0.25);
        diff.data.set([grey, grey, grey, 255], i);
      }
    }
  }
  const baselineBands = bandsOf(baseline);
  const recreatedBands = bandsOf(recreated);
  const gutter = 16;
  const composite = blankImage(
    width * 3 + gutter * 2,
    Math.max(baseline.height, recreated.height),
    [200, 200, 200, 255]
  );
  blit(composite, baseline, 0, 0);
  blit(composite, recreated, width + gutter, 0);
  blit(composite, diff, (width + gutter) * 2, 0);
  return {
    width,
    height,
    differingPixels: differing,
    ratio: differing / (width * height),
    bbox,
    baselineBands,
    recreatedBands,
    findings: compareBands(baselineBands, recreatedBands),
    composite,
  };
}

export function renderFidelityReport(
  result: FidelityResult,
  labels: { baseline: string; recreated: string; composite: string }
): string {
  const flagged = result.findings.filter(finding => finding.notes.length);
  const lines = [
    `# Today fidelity: ${labels.recreated}`,
    `Baseline: \`${labels.baseline}\`. Side by side (baseline | recreation | diff): \`${labels.composite}\`.`,
    `**Pixels:** ${(result.ratio * 100).toFixed(1)}% differ over ${result.width}×${result.height}${result.bbox ? `, inside x ${result.bbox.left}–${result.bbox.right}, y ${result.bbox.top}–${result.bbox.bottom}` : ''}.`,
    `**Structure:** ${result.baselineBands.length} blocks in the baseline, ${result.recreatedBands.length} in the recreation; ${flagged.length} differ by more than ${tolerance}px.`,
    '',
    '| # | Baseline | Recreation | Difference |',
    '| --- | --- | --- | --- |',
    ...result.findings.map(
      finding =>
        `| ${finding.index} | ${finding.baseline ? describe(finding.baseline) : '—'} | ${finding.recreated ? describe(finding.recreated) : '—'} | ${finding.notes.join(', ') || 'same'} |`
    ),
    '',
    'Blocks are aligned by shape (height and edges), so a missing banner shows as one missing row. ' +
      'Positions shift after any difference above; read the first difference first. A difference in an unchanged part is a fidelity bug (fix the recreation) unless DEVIATIONS.md gives a why.',
  ];
  return lines.join('\n');
}
