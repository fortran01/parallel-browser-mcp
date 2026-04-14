import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SessionRegistry, SessionRegistryError } from '../../sessions/SessionRegistry.js';
import {
  closeSessionSchema,
  startSessionSchema,
} from '../../types/toolArgs.js';
import { jsonResult, textResult } from '../../utils/mcp.js';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
};

export const registerSessionTools = (server: McpServer, registry: SessionRegistry): void => {
  server.registerTool(
    'start_session',
    {
      title: 'Start Session',
      description: 'Start a browser session using the configured provider.',
      inputSchema: startSessionSchema,
    },
    async (args) => {
      try {
        const session = await registry.startSession(args);

        return jsonResult(session);
      } catch (error) {
        return textResult(getErrorMessage(error), true);
      }
    },
  );

  server.registerTool(
    'close_session',
    {
      title: 'Close Session',
      description: 'Close a browser session by numeric session ID.',
      inputSchema: closeSessionSchema,
    },
    async ({ sessionId }) => {
      try {
        await registry.closeSession(sessionId);

        return jsonResult({
          sessionId,
          closed: true,
        });
      } catch (error) {
        return textResult(getErrorMessage(error), true);
      }
    },
  );

  server.registerTool(
    'close_all_sessions',
    {
      title: 'Close All Sessions',
      description: 'Close all active browser sessions.',
    },
    async () => {
      try {
        const closedCount = await registry.closeAllSessions();

        return jsonResult({
          closedCount,
        });
      } catch (error) {
        return textResult(getErrorMessage(error), true);
      }
    },
  );

  server.registerTool(
    'get_sessions',
    {
      title: 'Get Sessions',
      description: 'List all active browser sessions.',
    },
    async () => {
      try {
        return jsonResult({
          sessions: registry.getSessions(),
        });
      } catch (error) {
        return textResult(getErrorMessage(error), true);
      }
    },
  );
};
