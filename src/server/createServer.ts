import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ResolvedServerConfig } from '../config/serverConfig.js';
import { createProviders } from '../providers/createProvider.js';
import { SessionRegistry } from '../sessions/SessionRegistry.js';
import { registerBrowserTools } from '../tools/browser/registerBrowserTools.js';
import { registerSessionTools } from '../tools/session/registerSessionTools.js';

export interface BrowserMcpServer {
  server: McpServer;
  registry: SessionRegistry;
}

export const createServer = (config: ResolvedServerConfig): BrowserMcpServer => {
  const providers = createProviders(config);
  const registry = new SessionRegistry(providers, config.defaultProvider);
  const server = new McpServer(
    {
      name: 'browser-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        logging: {},
      },
      instructions:
        'Use start_session first to create a numeric browser session. Pass that sessionId to all browser_* tools.',
    },
  );

  registerSessionTools(server, registry);
  registerBrowserTools(server, registry);

  return {
    server,
    registry,
  };
};
