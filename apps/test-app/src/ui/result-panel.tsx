// The response panel: verdict, checks, decoded transaction, raw payload.
//
// The decoded views are the point. A signed PSBT as hex tells you nothing; the
// per-input signature table tells you which key signed, under which sighash
// flag, and whether that signature actually verifies.
import { useMemo } from 'react';

import { networkModeOf } from '../networks';
import type { SpecRun } from '../run-spec';
import { getNetwork } from '../session';
import { decodePsbt } from '../verifiers/psbt-decode';
import { verifyPsbtSignatures } from '../verifiers/psbt-signatures';
import { decodeStxTransaction } from '../verifiers/stx-decode';
import { describeOutcome, safeStringify, shortenMiddle } from './format';

interface ResultPanelProps {
  run?: SpecRun;
  history: SpecRun[];
}

function describeSigned(signed: boolean, finalized: boolean): string {
  if (!signed) return 'no';
  return finalized ? 'final' : 'yes';
}

function describeValid(signed: boolean, valid: boolean): string {
  if (!signed) return '—';
  return valid ? '✓' : '✗';
}

function readString(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const field = (value as Record<string, unknown>)[key];
  return typeof field === 'string' ? field : undefined;
}

export function ResultPanel({ run, history }: ResultPanelProps) {
  const psbtHex = run?.status === 'success' ? readString(run.payload, 'hex') : undefined;
  const stxHex =
    run?.status === 'success'
      ? (readString(run.payload, 'transaction') ?? readString(run.payload, 'txHex'))
      : undefined;

  const signatures = useMemo(() => {
    if (!psbtHex) return undefined;
    try {
      return verifyPsbtSignatures(psbtHex);
    } catch {
      return undefined;
    }
  }, [psbtHex]);

  const psbt = useMemo(() => {
    if (!psbtHex) return undefined;
    try {
      return decodePsbt(psbtHex, networkModeOf(getNetwork()));
    } catch {
      return undefined;
    }
  }, [psbtHex]);

  const stx = useMemo(() => {
    if (!stxHex) return undefined;
    try {
      return decodeStxTransaction(stxHex);
    } catch {
      return undefined;
    }
  }, [stxHex]);

  return (
    <aside
      className="result"
      data-testid="rpc-result"
      data-status={run?.status ?? 'idle'}
      data-method={run?.method ?? ''}
      data-id={run?.id ?? ''}
      data-verdict={run?.verdict ?? 'idle'}
    >
      <h2>Result</h2>
      {!run && (
        <p className="muted">Fire a request to see the params sent and the wallet response.</p>
      )}

      {run && (
        <div className="result-body">
          <div className="result-head">
            <span className={`status status-${run.status}`}>{run.status}</span>
            <span className={`verdict verdict-${run.verdict}`} data-testid="rpc-verdict">
              {run.verdict}
            </span>
            <code>{run.method}</code>
            <span className="muted">{run.durationMs} ms</span>
          </div>
          <p className="muted">
            {describeOutcome(run.expected)}
            {run.reason ? ` — ${run.reason}` : ''}
          </p>

          {run.verify && (
            <>
              <h3>Checks</h3>
              <ul className="checks" data-testid="rpc-checks">
                {run.verify.checks.map((check, index) => (
                  <li key={`${check.label}-${index}`} data-ok={check.ok}>
                    <span className={check.ok ? 'check-ok' : 'check-fail'}>
                      {check.ok ? '✓' : '✗'}
                    </span>{' '}
                    {check.label}
                    {check.detail && <span className="muted"> — {check.detail}</span>}
                  </li>
                ))}
              </ul>
            </>
          )}

          {signatures && signatures.length > 0 && (
            <>
              <h3>Signatures</h3>
              <div className="table-wrap">
                <table data-testid="rpc-signatures">
                  <thead>
                    <tr>
                      <th>in</th>
                      <th>signed</th>
                      <th>key</th>
                      <th>sighash</th>
                      <th>declared</th>
                      <th>valid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {signatures.map((report, index) => (
                      <tr key={`${report.index}-${index}`}>
                        <td>{report.index}</td>
                        <td>{describeSigned(report.signed, report.finalized)}</td>
                        <td>{report.pubkey ? shortenMiddle(report.pubkey, 6) : '—'}</td>
                        <td>{report.sighashName ?? '—'}</td>
                        <td>{report.matchesDeclared ? 'matches' : 'MISMATCH'}</td>
                        <td className={report.signed && !report.valid ? 'check-fail' : undefined}>
                          {describeValid(report.signed, report.valid)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {psbt && (
            <>
              <h3>Transaction</h3>
              <p className="muted">
                {psbt.inputs.length} in / {psbt.outputs.length} out · fee {psbt.fee} sats
              </p>
              <div className="table-wrap">
                <table>
                  <tbody>
                    {psbt.outputs.map(output => (
                      <tr key={`out-${output.index}`}>
                        <td>out {output.index}</td>
                        <td>{output.isOpReturn ? 'OP_RETURN' : (output.address ?? '—')}</td>
                        <td>{output.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {stx && (
            <>
              <h3>Stacks transaction</h3>
              <pre data-testid="rpc-stx-decoded">{safeStringify(stx)}</pre>
            </>
          )}

          <h3>Request params</h3>
          <pre data-testid="rpc-result-params">{safeStringify(run.params)}</pre>

          <h3>{run.status === 'error' ? 'Error' : 'Response'}</h3>
          <pre
            className={run.status === 'error' ? 'pre-error' : undefined}
            data-testid="rpc-result-payload"
          >
            {safeStringify(run.payload)}
          </pre>

          {history.length > 1 && (
            <>
              <h3>History</h3>
              <ul className="history" data-testid="rpc-history">
                {[...history]
                  .reverse()
                  .slice(1)
                  .map((entry, index) => (
                    <li
                      key={`${entry.id}-${index}`}
                      data-id={entry.id}
                      data-verdict={entry.verdict}
                    >
                      <span className={`verdict verdict-${entry.verdict}`}>{entry.verdict}</span>{' '}
                      <code>{entry.id}</code>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>
      )}
    </aside>
  );
}
