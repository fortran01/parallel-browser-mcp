import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import type { SessionRecord } from '../../types/session.js';
import { textResult } from '../../utils/mcp.js';
import { SessionRegistry, SessionRegistryError } from '../../sessions/SessionRegistry.js';

type SessionArgs = {
  sessionId: number;
};

type BrowserToolExecutor<TArgs extends SessionArgs> = (
  session: SessionRecord,
  args: TArgs,
) => Promise<CallToolResult>;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
};

export const withSession = <TArgs extends SessionArgs>(
  registry: SessionRegistry,
  executor: BrowserToolExecutor<TArgs>,
) => {
  return async (args: TArgs): Promise<CallToolResult> => {
    try {
      const session = registry.getSessionOrThrow(args.sessionId);

      return await executor(session, args);
    } catch (error) {
      const message =
        error instanceof SessionRegistryError
          ? error.message
          : `Tool failed: ${getErrorMessage(error)}`;

      return textResult(message, true);
    }
  };
};
