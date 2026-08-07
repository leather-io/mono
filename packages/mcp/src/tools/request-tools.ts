import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

import { type ToolContext, errorToolResult, jsonToolResult } from './tool-helpers';

function requestView(context: ToolContext, requestId: string) {
  const request = context.requests.getOrThrow(requestId);
  return {
    requestId: request.id,
    kind: request.kind,
    status: request.state,
    summary: request.summary,
    result: request.result,
    error: request.error,
    expiresAt: new Date(request.expiresAt).toISOString(),
  };
}

export function registerRequestTools(server: McpServer, context: ToolContext) {
  server.registerTool(
    'check_request',
    {
      title: 'Check a pending request',
      description:
        'Polls the status of a connect or propose request: pending, opened, approved (with txid), rejected, failed, expired, or cancelled. Requests do not survive a server restart.',
      inputSchema: {
        requestId: z.string(),
      },
    },
    args => {
      try {
        return jsonToolResult(requestView(context, args.requestId));
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );

  server.registerTool(
    'cancel_request',
    {
      title: 'Cancel a pending request',
      description:
        'Cancels a non-terminal connect or propose request so a new one can be created. Cannot cancel a request the user already resolved.',
      inputSchema: {
        requestId: z.string(),
      },
    },
    args => {
      try {
        context.requests.cancel(args.requestId);
        return jsonToolResult(requestView(context, args.requestId));
      } catch (error) {
        return errorToolResult(error);
      }
    }
  );
}
