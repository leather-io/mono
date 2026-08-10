import { type IncomingMessage, type Server, type ServerResponse, createServer } from 'node:http';
import { z } from 'zod';

import { type McpConfig, serverVersion } from './config';
import { getStaticAsset, renderBridgePage } from './pages/render';
import { type PendingRequestStore, isTerminalState } from './pending-requests';

const maxBodyBytes = 1024 * 1024;

const resultBodySchema = z.object({
  outcome: z.enum(['approved', 'rejected', 'failed']),
  result: z.unknown().optional(),
  error: z
    .object({
      code: z.union([z.string(), z.number()]),
      message: z.string().optional(),
    })
    .optional(),
});

interface HttpListenerDeps {
  config: McpConfig;
  requests: PendingRequestStore;
  onConnectApproved(payload: unknown): void;
}

function sendJson(res: ServerResponse, status: number, value: unknown) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(value));
}

function sendHtml(res: ServerResponse, html: string) {
  res.writeHead(200, {
    'content-type': 'text/html; charset=utf-8',
    'content-security-policy':
      "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'",
  });
  res.end(html);
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buffer.length;
    if (total > maxBodyBytes) return undefined;
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return undefined;
  }
}

async function handleRequest(deps: HttpListenerDeps, req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', deps.config.baseUrl);
  const segments = url.pathname.split('/').filter(Boolean);

  if (req.method === 'GET' && url.pathname === '/health') {
    return sendJson(res, 200, { service: 'leather-mcp', version: serverVersion });
  }

  if (req.method === 'GET') {
    const asset = getStaticAsset(url.pathname);
    if (asset) {
      res.writeHead(200, { 'content-type': asset.contentType, 'cache-control': 'no-cache' });
      return res.end(asset.body);
    }
  }

  if (
    req.method === 'GET' &&
    segments.length === 2 &&
    (segments[0] === 'connect' || segments[0] === 'approve')
  ) {
    const page = segments[0] === 'connect' ? 'connect' : 'approve';
    return sendHtml(res, renderBridgePage(page, segments[1]));
  }

  if (segments.length >= 2 && segments[0] === 'api' && segments[1] === 'requests') {
    const requestId = segments[2];
    if (!requestId) return sendJson(res, 404, { ok: false });
    const request = deps.requests.get(requestId);
    if (!request) return sendJson(res, 404, { ok: false });

    if (req.method === 'GET' && segments.length === 3) {
      if (isTerminalState(request.state)) return sendJson(res, 410, { state: request.state });
      deps.requests.markOpened(requestId);
      return sendJson(res, 200, {
        id: request.id,
        kind: request.kind,
        state: request.state,
        summary: request.summary,
        rpcMethod: request.rpcMethod,
        rpcParams: request.rpcParams,
        pairingCode: request.pairingCode,
      });
    }

    if (req.method === 'POST' && segments.length === 4 && segments[3] === 'result') {
      if (isTerminalState(request.state))
        return sendJson(res, 409, { ok: false, state: request.state });
      const body = resultBodySchema.safeParse(await readJsonBody(req));
      if (!body.success) return sendJson(res, 400, { ok: false });
      const outcome = body.data.outcome;
      const error = body.data.error
        ? { code: body.data.error.code, message: body.data.error.message ?? '' }
        : undefined;

      if (request.kind === 'connect' && outcome === 'approved') {
        try {
          deps.onConnectApproved(body.data.result);
          deps.requests.complete(requestId, 'approved', {});
        } catch (mappingError) {
          const message =
            mappingError instanceof Error ? mappingError.message : String(mappingError);
          deps.requests.complete(requestId, 'failed', {
            error: { code: 'INVALID_PARAMS', message },
          });
          return sendJson(res, 422, { ok: false, message });
        }
      } else {
        deps.requests.complete(requestId, outcome, { result: body.data.result, error });
      }
      return sendJson(res, 200, { ok: true });
    }
  }

  return sendJson(res, 404, { ok: false });
}

export function startHttpListener(deps: HttpListenerDeps): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      handleRequest(deps, req, res).catch(() => sendJson(res, 500, { ok: false }));
    });
    server.once('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        reject(
          new Error(
            `Port ${deps.config.port} is already in use. Set LEATHER_MCP_PORT to a free port, but note the wallet's connection permission is tied to the port, so a changed port requires re-connecting.`
          )
        );
        return;
      }
      reject(error);
    });
    server.listen(deps.config.port, deps.config.host, () => resolve(server));
  });
}
