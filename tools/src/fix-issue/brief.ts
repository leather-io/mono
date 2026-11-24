const briefStart = '<!-- fix-issue:brief -->';
const briefEnd = '<!-- /fix-issue:brief -->';
const briefSummary = '<summary>The brief this pull request was written from</summary>';
const maxCommentLength = 65_536;

export function renderBriefComment(brief: string | undefined): string | null {
  const text = (brief ?? '').trim();
  if (text === '') return null;
  const comment = [
    briefStart,
    '<details>',
    briefSummary,
    '',
    text,
    '',
    '</details>',
    briefEnd,
    '',
  ].join('\n');
  return comment.length > maxCommentLength ? null : comment;
}

export function isBriefComment(body: string | null): boolean {
  return body !== null && body.trimStart().startsWith(briefStart);
}

export function extractBrief(body: string): string | null {
  const start = body.indexOf(briefSummary);
  const end = body.lastIndexOf('</details>');
  if (!isBriefComment(body) || start === -1 || end <= start) return null;
  return body.slice(start + briefSummary.length, end).trim();
}
