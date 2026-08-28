// Renders any `SpecBuilder` as a row of selects plus a Send button.
//
// One component for every request family: the fields are data, so adding a
// builder needs no UI work at all.
import { useState } from 'react';

import {
  type BuilderSelection,
  type SpecBuilder,
  buildFromSelection,
  normalizeSelection,
  visibleFields,
} from '../builders/spec-builder';
import type { SpecRun } from '../run-spec';
import type { RpcMethodSpec } from '../types';

interface SpecBuilderPanelProps {
  builder: SpecBuilder;
  busy: boolean;
  onSend(spec: RpcMethodSpec): void;
  onSweep(specs: RpcMethodSpec[]): Promise<SpecRun[]>;
}

/** Selects carry strings; the field's own options say what the value really is. */
function decode(builder: SpecBuilder, key: string, raw: string, selection: BuilderSelection) {
  const field = builder.fields.find(candidate => candidate.key === key);
  const option = field?.options(selection).find(candidate => String(candidate.value) === raw);
  return option ? option.value : raw;
}

export function SpecBuilderPanel({ builder, busy, onSend, onSweep }: SpecBuilderPanelProps) {
  const [selection, setSelection] = useState<BuilderSelection>(() =>
    normalizeSelection(builder, {})
  );
  const [sweeping, setSweeping] = useState(false);
  const [results, setResults] = useState<SpecRun[] | undefined>();

  // Building a spec is object construction, not work worth memoizing.
  const spec = buildFromSelection(builder, selection);
  const fields = visibleFields(builder, selection);

  function choose(key: string, raw: string) {
    setSelection(current =>
      normalizeSelection(builder, { ...current, [key]: decode(builder, key, raw, current) })
    );
  }

  async function sweep() {
    setSweeping(true);
    setResults(undefined);
    try {
      setResults(
        await onSweep(
          builder.combinations().map(combination => buildFromSelection(builder, combination))
        )
      );
    } finally {
      setSweeping(false);
    }
  }

  const passed = results?.filter(result => result.verdict === 'pass').length ?? 0;
  const failed = results?.filter(result => result.verdict === 'fail').length ?? 0;

  return (
    <section className="builder" data-testid={`builder-${builder.id}`} data-selection={spec.id}>
      <div className="builder-head">
        <strong>{builder.label}</strong>
        <span className="muted">{builder.description}</span>
      </div>

      <div className="builder-controls">
        {fields.map(({ field, options }) => (
          <label className="field" key={field.key}>
            <span>{field.label}</span>
            <select
              data-control={`${builder.id}-${field.key}`}
              value={String(selection[field.key])}
              onChange={event => choose(field.key, event.target.value)}
            >
              {options.map(option => (
                <option key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ))}

        <button
          type="button"
          data-control={`${builder.id}-send`}
          disabled={busy}
          onClick={() => onSend(spec)}
        >
          {busy ? 'Waiting…' : 'Send'}
        </button>
        <button
          type="button"
          className="secondary"
          data-control={`${builder.id}-sweep`}
          disabled={sweeping}
          onClick={() => void sweep()}
        >
          {sweeping ? 'Running…' : `Run ${builder.combinations().length} combinations`}
        </button>
      </div>

      <p className="card-desc">{spec.description}</p>
      <code className="card-method">{spec.id}</code>

      {results && (
        <>
          <p
            className="muted"
            data-testid={`builder-${builder.id}-summary`}
            data-passed={passed}
            data-failed={failed}
          >
            {passed} passed · {failed} failed · {results.length - passed - failed} unjudged
          </p>
          <div className="table-wrap sweep-results">
            <table data-testid={`builder-${builder.id}-results`}>
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
        </>
      )}
    </section>
  );
}
