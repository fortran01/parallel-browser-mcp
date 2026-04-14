import type { Browser, BrowserContext, Page } from 'playwright-core';
import { describe, expect, it, vi } from 'vitest';
import { BrowserProvider, type ProviderStartSessionParams } from '../providers/BrowserProvider.js';
import { SessionRegistry } from './SessionRegistry.js';
import type { StartedBrowserSession } from '../types/session.js';

const createStartedSession = (): StartedBrowserSession => ({
  browser: { close: vi.fn() } as unknown as Browser,
  context: { close: vi.fn() } as unknown as BrowserContext,
  page: { close: vi.fn() } as unknown as Page,
  providerSessionId: 'remote-1',
  metadata: { test: true },
  resolvedProviderConfig: {
    launchOptions: {},
    contextOptions: {},
    storageStatePath: null,
    executablePath: null,
    channel: null,
  },
});

class TestProvider extends BrowserProvider {
  constructor() {
    super('playwright');
  }

  readonly startSessionMock = vi.fn(
    async (_params: ProviderStartSessionParams) => createStartedSession(),
  );
  readonly closeSessionMock = vi.fn(async (_session: StartedBrowserSession) => undefined);

  async startSession(params: ProviderStartSessionParams): Promise<StartedBrowserSession> {
    return this.startSessionMock(params);
  }

  async closeSession(session: StartedBrowserSession): Promise<void> {
    await this.closeSessionMock(session);
  }
}

describe('SessionRegistry', () => {
  it('allocates sequential numeric IDs', async () => {
    const provider = new TestProvider();
    const registry = new SessionRegistry(new Map([['playwright', provider]]), 'playwright');

    const first = await registry.startSession({});
    const second = await registry.startSession({});

    expect(first.id).toBe(1);
    expect(second.id).toBe(2);
  });

  it('closes a session and removes it from the registry', async () => {
    const provider = new TestProvider();
    const registry = new SessionRegistry(new Map([['playwright', provider]]), 'playwright');
    const session = await registry.startSession({});

    await registry.closeSession(session.id);

    expect(provider.closeSessionMock).toHaveBeenCalledTimes(1);
    expect(registry.getSessions()).toHaveLength(0);
  });

  it('closes all sessions idempotently', async () => {
    const provider = new TestProvider();
    const registry = new SessionRegistry(new Map([['playwright', provider]]), 'playwright');
    await registry.startSession({});
    await registry.startSession({});

    const closedCount = await registry.closeAllSessions();
    const closedAgain = await registry.closeAllSessions();

    expect(closedCount).toBe(2);
    expect(closedAgain).toBe(0);
  });
});
