import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Browser, BrowserContext, Page } from 'playwright-core';
import { AnchorBrowserProvider } from './AnchorBrowserProvider.js';

const mocks = vi.hoisted(() => ({
  sessionsCreate: vi.fn(),
  sessionsDelete: vi.fn(),
  anchorConstructor: vi.fn(),
  connectOverCDP: vi.fn(),
}));

vi.mock('anchorbrowser', () => {
  return {
    default: class AnchorbrowserMock {
      sessions = {
        create: mocks.sessionsCreate,
        delete: mocks.sessionsDelete,
      };

      constructor(...args: unknown[]) {
        mocks.anchorConstructor(...args);
      }
    },
  };
});

vi.mock('playwright-core', () => ({
  chromium: {
    connectOverCDP: mocks.connectOverCDP,
  },
}));

describe('AnchorBrowserProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates an Anchor session and maps config into session payload', async () => {
    const page = {
      close: vi.fn(),
    } as unknown as Page;
    const context = {
      pages: () => [page],
    } as unknown as BrowserContext;
    const browser = {
      contexts: () => [context],
      close: vi.fn(),
    } as unknown as Browser;

    mocks.sessionsCreate.mockResolvedValue({
      data: {
        id: 'anchor-session',
        cdp_url: 'wss://anchor',
        live_view_url: 'https://live-view',
      },
    });
    mocks.connectOverCDP.mockResolvedValue(browser);

    const provider = new AnchorBrowserProvider({
      apiKey: 'api-key',
      recording: false,
      proxy: { active: true, type: 'anchor_proxy' },
      timeout: { maxDuration: 10, idleTimeout: 5 },
      sessionOptions: {},
    });
    const session = await provider.startSession({ sessionName: 'Regression' });

    expect(mocks.anchorConstructor).toHaveBeenCalledWith({ apiKey: 'api-key' });
    expect(mocks.sessionsCreate).toHaveBeenCalledWith({
      session: {
        recording: { active: false },
        proxy: { active: true, type: 'anchor_proxy' },
        timeout: { max_duration: 10, idle_timeout: 5 },
        tags: ['Regression'],
      },
    });
    expect(mocks.connectOverCDP).toHaveBeenCalledWith('wss://anchor');
    expect(session.providerSessionId).toBe('anchor-session');
  });
});
