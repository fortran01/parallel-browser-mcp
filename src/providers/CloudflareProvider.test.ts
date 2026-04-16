import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Browser, BrowserContext, Page } from 'playwright-core';
import { CloudflareProvider } from './CloudflareProvider.js';

const mocks = vi.hoisted(() => ({
  connectOverCDP: vi.fn(),
}));

vi.mock('playwright-core', () => ({
  chromium: {
    connectOverCDP: mocks.connectOverCDP,
  },
}));

describe('CloudflareProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('connects over CDP using the Cloudflare WebSocket endpoint', async () => {
    const page = { close: vi.fn() } as unknown as Page;
    const context = { pages: () => [page] } as unknown as BrowserContext;
    const browser = {
      contexts: () => [context],
      close: vi.fn(),
    } as unknown as Browser;

    mocks.connectOverCDP.mockResolvedValue(browser);

    const provider = new CloudflareProvider({
      apiKey: 'test-token',
      accountId: 'test-account',
      keepAlive: 300000,
    });

    const session = await provider.startSession({ sessionName: 'test' });

    expect(mocks.connectOverCDP).toHaveBeenCalledWith(
      'wss://api.cloudflare.com/client/v4/accounts/test-account/browser-rendering/devtools/browser?keep_alive=300000',
      {
        headers: {
          Authorization: 'Bearer test-token',
        },
      },
    );
    expect(session.providerSessionId).toBeNull();
    expect(session.metadata.browserWSEndpoint).toContain('test-account');
  });

  it('uses default keepAlive of 600000 when not configured', async () => {
    const page = { close: vi.fn() } as unknown as Page;
    const context = { pages: () => [page] } as unknown as BrowserContext;
    const browser = {
      contexts: () => [context],
      close: vi.fn(),
    } as unknown as Browser;

    mocks.connectOverCDP.mockResolvedValue(browser);

    const provider = new CloudflareProvider({
      apiKey: 'test-token',
      accountId: 'test-account',
      keepAlive: null,
    });

    await provider.startSession({ sessionName: null });

    expect(mocks.connectOverCDP).toHaveBeenCalledWith(
      expect.stringContaining('keep_alive=600000'),
      expect.any(Object),
    );
  });

  it('throws when apiKey is missing', async () => {
    const provider = new CloudflareProvider({
      apiKey: null,
      accountId: 'test-account',
      keepAlive: null,
    });

    await expect(provider.startSession({ sessionName: null })).rejects.toThrow(
      'CLOUDFLARE_API_TOKEN',
    );
  });

  it('throws when accountId is missing', async () => {
    const provider = new CloudflareProvider({
      apiKey: 'test-token',
      accountId: null,
      keepAlive: null,
    });

    await expect(provider.startSession({ sessionName: null })).rejects.toThrow(
      'CLOUDFLARE_ACCOUNT_ID',
    );
  });
});
