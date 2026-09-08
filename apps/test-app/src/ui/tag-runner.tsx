// Run every spec carrying a tag and show the verdicts as a table.
//
// This is what turns the sighash matrix from ~50 buttons into one action with
// a pass/fail column — and it is the same code path an agent gets through
// `__leatherTestApp.runTag`.
import { useState } from 'react';

import type { SpecRun } from '../run-spec';

interface TagRunnerProps {
  tags: string[];
  onRun(tag: string): Promise<SpecRun[]>;
}

export function TagRunner({ tags, onRun }: TagRunnerProps) {
  const [tag, setTag] = useState(tags[0] ?? '');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<SpecRun[] | undefined>();

  async function run() {
    setRunning(true);
    setResults(undefined);
    try {
      setResults(await onRun(tag));
    } finally {
      setRunning(false);
    }
  }

  const passed = results?.filter(result => result.verdict === 'pass').length ?? 0;
  const failed = results?.filter(result => result.verdict === 'fail').length ?? 0;

  return (
    <div className="tag-runner" data-testid="tag-runner" data-running={running}>
      <label className="field">
        <span>Run tag</span>
        <select data-testid="tag-select" value={tag} onChange={event => setTag(event.target.value)}>
          {tags.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        data-control="run-tag"
        disabled={running || !tag}
        onClick={() => void run()}
      >
        {running ? 'Running…' : 'Run'}
      </button>
      {results && (
        <span data-testid="tag-summary" data-passed={passed} data-failed={failed}>
          {passed} passed · {failed} failed · {results.length - passed - failed} unjudged
        </span>
      )}
      {results && (
        <div className="table-wrap tag-results">
          <table data-testid="tag-results">
            <tbody>
              {results.map(result => (
                <tr key={result.id} data-id={result.id} data-verdict={result.verdict}>
                  <td>
                    <span className={`verdict verdict-${result.verdict}`}>{result.verdict}</span>
                  </td>
                  <td>
                    <code>{result.id}</code>
                  </td>
                  <td className="muted">{result.reason ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
