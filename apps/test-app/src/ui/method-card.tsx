// One catalog entry: what it sends, what it expects, and how it last went.
// The whole card is the send button, so it carries the spec's `data-testid`.
import type { SpecVerdict } from '../run-spec';
import type { Outcome, RpcMethodSpec } from '../types';
import { describeOutcome } from './format';

interface MethodCardProps {
  spec: RpcMethodSpec;
  busy: boolean;
  expectation: Outcome;
  verdict?: SpecVerdict;
  onSend(): void;
}

export function MethodCard({ spec, busy, expectation, verdict, onSend }: MethodCardProps) {
  return (
    <button
      type="button"
      className="card"
      data-testid={spec.id}
      data-verdict={verdict ?? 'none'}
      data-requires={(spec.requires ?? []).join(' ')}
      disabled={busy}
      aria-busy={busy}
      onClick={onSend}
    >
      <span className="card-head">
        <span className="card-title">{spec.label}</span>
        {busy && <span className="verdict verdict-idle">waiting…</span>}
        {!busy && verdict && <span className={`verdict verdict-${verdict}`}>{verdict}</span>}
      </span>
      <code className="card-method">{spec.method}</code>
      <span className="card-desc">{spec.description}</span>
      <span className="card-meta">
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
      </span>
    </button>
  );
}
