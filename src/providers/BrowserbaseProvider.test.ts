import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Browser, BrowserContext, Page } from 'playwright-core';
import { BrowserbaseProvider } from './BrowserbaseProvider.js';

const mocks = vi.hoisted(() => ({
  sessionsCreate: vi.fn(),
  browserbaseConstructor: vi.fn(),
  connectOverCDP: vi.fn(),
}));

vi.mock('@browserbasehq/sdk', () => {
  return {
    default: class BrowserbaseMock {
      sessions = {
        create: mocks.sessionsCreate,
      };

      constructor(...args: unknown[]) {
        mocks.browserbaseConstructor(...args);
      }
    },
  };
});

vi.mock('playwright-core', () => ({
  chromium: {
    connectOverCDP: mocks.connectOverCDP,
  },
}));

describe('BrowserbaseProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a Browserbase session and connects over CDP', async () => {
    const page = {} as Page;
    const context = { pages: () => [page] } as unknown as BrowserContext;
    const browser = { contexts: () => [context] } as unknown as Browser;

    mocks.sessionsCreate.mockResolvedValue({
      id: 'bb-session',
      connectUrl: 'wss://browserbase',
      status: 'RUNNING',
    });
    mocks.connectOverCDP.mockResolvedValue(browser);

    const provider = new BrowserbaseProvider({
      apiKey: 'api-key',
      projectId: 'project-id',
      proxy: true,
      keepAlive: true,
      contextId: 'ctx-1',
      persist: true,
      sessionOptions: {},
    });
    const session = await provider.startSession({ sessionName: 'QA run' });

    expect(mocks.browserbaseConstructor).toHaveBeenCalledWith({ apiKey: 'api-key' });
    expect(mocks.sessionsCreate).toHaveBeenCalledWith({
      projectId: 'project-id',
      keepAlive: true,
      userMetadata: { sessionName: 'QA run' },
      proxies: true,
      browserSettings: {
        context: {
          id: 'ctx-1',
          persist: true,
        },
      },
    });
    expect(mocks.connectOverCDP).toHaveBeenCalledWith('wss://browserbase');
    expect(session.providerSessionId).toBe('bb-session');
  });
});
