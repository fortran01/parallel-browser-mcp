#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { loadServerConfig } from './config/loadServerConfig.js';
import { createServer } from './server/createServer.js';

const main = async (): Promise<void> => {
  const config = loadServerConfig();
  const { server, registry } = createServer(config);
  const transport = new StdioServerTransport();

  const shutdown = async (): Promise<void> => {
    await registry.closeAllSessions({ reason: 'shutdown' }).catch(() => undefined);
    await server.close().catch(() => undefined);
  };

  process.once('SIGINT', () => {
    void shutdown().finally(() => process.exit(0));
  });

  process.once('SIGTERM', () => {
    void shutdown().finally(() => process.exit(0));
  });

  await server.connect(transport);
  console.error('browser-mcp running on stdio');
};

main().catch((error) => {
  console.error('Fatal error in browser-mcp:', error);
  process.exit(1);
});
