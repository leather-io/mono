import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { registerConnectionTools } from './connection-tools';
import { registerLookTools } from './look-tools';
import { registerProposeTools } from './propose-tools';
import { registerRequestTools } from './request-tools';
import type { ToolContext } from './tool-helpers';

export function registerTools(server: McpServer, context: ToolContext) {
  registerConnectionTools(server, context);
  registerLookTools(server, context);
  registerProposeTools(server, context);
  registerRequestTools(server, context);
}
