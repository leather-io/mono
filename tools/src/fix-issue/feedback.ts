import { maxRevises } from './revise-state.js';

interface MergeNote {
  readonly dev: string;
  readonly conflicts: readonly string[];
}

interface RenderFeedbackOptions {
  readonly pullRequest: number;
  readonly ordinal: number;
  readonly requestedBy: string;
  readonly instructions: string;
  readonly merge: MergeNote | null;
}

function renderMerge({ dev, conflicts }: MergeNote): string[] {
  const intro = `The workflow merged \`dev\` at \`${dev}\` into the pull request branch before you started.`;
  if (conflicts.length === 0) {
    return [
      '## `dev` was merged into the branch',
      '',
      `${intro} The merge had no conflicts. Check that the change still does its job against the newer code on \`dev\`.`,
    ];
  }
  return [
    '## `dev` was merged into the branch and conflicts',
    '',
    `${intro} These files conflict; resolve every one:`,
    '',
    ...conflicts.map(file => `- \`${file}\``),
  ];
}

export function renderFeedback({
  pullRequest,
  ordinal,
  requestedBy,
  instructions,
  merge,
}: RenderFeedbackOptions): string {
  const sections: string[][] = [
    [
      `# Feedback on pull request #${pullRequest}`,
      '',
      `Revise ${ordinal} of ${maxRevises}, asked for by @${requestedBy}. The status file needs one line under \`answers\` per thing asked for below.`,
    ],
  ];
  if (instructions !== '') {
    sections.push([`## What @${requestedBy} asked for`, '', instructions]);
  }
  if (merge) sections.push(renderMerge(merge));
  return `${sections.map(section => section.join('\n')).join('\n\n')}\n`;
}
