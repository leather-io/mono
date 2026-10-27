import { spawn } from 'node:child_process';

export const claudeModel = 'claude-opus-5-5';
const claudeEffort = 'high';

export function buildClaudeArgs({ systemPromptPath, schema, tools = [], addDirs = [] }) {
  const toolList = tools.join(',');
  return [
    '--print',
    '--output-format',
    'json',
    '--model',
    claudeModel,
    '--effort',
    claudeEffort,
    '--tools',
    toolList,
    ...(tools.length > 0 ? ['--allowedTools', toolList] : []),
    '--setting-sources',
    '',
    '--strict-mcp-config',
    '--no-session-persistence',
    ...addDirs.flatMap(dir => ['--add-dir', dir]),
    '--system-prompt-file',
    systemPromptPath,
    '--json-schema',
    JSON.stringify(schema),
  ];
}

export function parseClaudeOutput(text) {
  try {
    const parsed = JSON.parse(text);
    if (parsed?.is_error || parsed?.structured_output === undefined) return null;
    return parsed.structured_output;
  } catch {
    return null;
  }
}

export function runClaude({ args, prompt, cwd }) {
  return new Promise((resolve, reject) => {
    const command = process.env.CLAUDE_BIN || 'claude';
    const child = spawn(command, args, { cwd, stdio: ['pipe', 'pipe', 'inherit'] });
    let stdout = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', chunk => {
      stdout += chunk;
    });
    child.on('error', reject);
    child.on('close', code => {
      const output = parseClaudeOutput(stdout);
      if (code === 0 && output !== null) {
        resolve(output);
      } else {
        reject(new Error(`Claude exited with ${code} and no structured output`));
      }
    });
    child.stdin.end(prompt);
  });
}
