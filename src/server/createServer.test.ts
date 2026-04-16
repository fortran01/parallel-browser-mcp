import { describe, expect, it } from 'vitest';
import { createServer } from './createServer.js';

describe('createServer', () => {
  it('creates a server and registry', () => {
    const browserServer = createServer({
      defaultProvider: 'playwright',
      providers: {
        browserbase: {
          apiKey: null,
          projectId: null,
          proxy: null,
          keepAlive: false,
          contextId: null,
          persist: true,
          sessionOptions: {},
        },
        anchor: {
          apiKey: null,
          recording: null,
          proxy: null,
          timeout: null,
          sessionOptions: {},
        },
        playwright: {
          launchOptions: {},
          contextOptions: {},
          storageStatePath: null,
          executablePath: null,
          channel: null,
        },
        cloudflare: {
          apiKey: null,
          accountId: null,
          keepAlive: null,
        },
      },
    });

    expect(browserServer.server).toBeDefined();
    expect(browserServer.registry).toBeDefined();
  });
});
