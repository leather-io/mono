const HTML_REGEX = /<\w+[\s\S]*?>/;

const HTML_TEMPLATE_STYLES = `
    body {
      margin: 0;
      padding: 16px;
      background: #12100f;
      color: #f5f1ed;
      overflow: hidden;
    }
    pre {
      margin: 0;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Liberation Mono", "Courier New", monospace;
      font-size: 15px;
      background: none;
      color: #f5f1ed;
      white-space: pre-wrap;
      word-break: break-word;
    }
  `;

function createHtmlTemplate(content: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>${HTML_TEMPLATE_STYLES}</style>
</head>
<body><pre>${content}</pre></body>
</html>`;
}

export function createHtmlDataUrl(html: string): string {
  const wrappedHtml = createHtmlTemplate(html);
  return `data:text/html;charset=utf-8,${encodeURIComponent(wrappedHtml)}`;
}

export function formatText(src: string): string {
  try {
    const parsed = JSON.parse(src);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return src;
  }
}

export function isHtmlContent(text: string): boolean {
  const preview = text.slice(0, 512);
  return HTML_REGEX.test(preview);
}
