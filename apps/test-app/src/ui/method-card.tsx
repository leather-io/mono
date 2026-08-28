// One catalog entry: what it sends, what it expects, how it last went, and an
// escape hatch to edit the payload before sending it.
import type { SpecVerdict } from '../run-spec';
import type { Outcome, RpcMethodSpec } from '../types';
import { describeOutcome } from './format';

interface MethodCardProps {
  spec: RpcMethodSpec;
  busy: boolean;
  expectation: Outcome;
  verdict?: SpecVerdict;
  editing: boolean;
  draft: string;
  onDraftChange(value: string): void;
  onSend(): void;
  onEdit(): void;
  onSendEdited(): void;
}

export function MethodCard({
  spec,
  busy,
  expectation,
  verdict,
  editing,
  draft,
  onDraftChange,
  onSend,
  onEdit,
  onSendEdited,
}: MethodCardProps) {
  return (
    <article
      className="card"
      data-testid={`card-${spec.id}`}
      data-verdict={verdict ?? 'none'}
      data-requires={(spec.requires ?? []).join(' ')}
    >
      <div className="card-head">
        <span className="card-title">{spec.label}</span>
        {verdict && <span className={`verdict verdict-${verdict}`}>{verdict}</span>}
      </div>
      <code className="card-method">{spec.method}</code>
      <p className="card-desc">{spec.description}</p>
      <div className="card-meta">
        <span className="muted">{describeOutcome(expectation)}</span>
        {(spec.requires ?? []).map(requirement => (
          <span key={requirement} className="chip chip-requires">
            {requirement}
          </span>
        ))}
        {(spec.tags ?? []).map(tag => (
          <span key={tag} className="chip">
            {tag}
          </span>
        ))}
      </div>
      <div className="card-actions">
        <button type="button" data-testid={spec.id} disabled={busy} onClick={onSend}>
          {busy ? 'Waiting…' : 'Send'}
        </button>
        <button
          type="button"
          className="secondary"
          data-control={`edit-${spec.id}`}
          onClick={onEdit}
        >
          {editing ? 'Close' : 'Edit JSON'}
        </button>
      </div>
      {editing && (
        <div className="editor">
          <textarea
            data-testid={`editor-${spec.id}`}
            value={draft}
            spellCheck={false}
            onChange={event => onDraftChange(event.target.value)}
          />
          <button type="button" data-control={`send-edited-${spec.id}`} onClick={onSendEdited}>
            Send edited
          </button>
        </div>
      )}
    </article>
  );
}
