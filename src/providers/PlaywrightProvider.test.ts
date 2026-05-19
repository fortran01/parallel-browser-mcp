import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Browser, BrowserContext, Page } from 'playwright-core';
import { PlaywrightProvider } from './PlaywrightProvider.js';

const mocks = vi.hoisted(() => {
  const newPage = vi.fn(async () => ({}) as Page);
  const newContext = vi.fn(
    async () => ({ newPage, close: vi.fn() }) as unknown as BrowserContext,
  );
  const launch = vi.fn(async () => ({ newContext, close: vi.fn() }) as unknown as Browser);
  const cloakLaunch = vi.fn(
    async () => ({ newContext, close: vi.fn() }) as unknown as Browser,
  );

  return {
    newPage,
    newContext,
    launch,
    cloakLaunch,
  };
});

vi.mock('playwright', () => ({
  chromium: {
    launch: mocks.launch,
  },
}));

vi.mock('cloakbrowser', () => ({
  launch: mocks.cloakLaunch,
}));

describe('PlaywrightProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('launches a local browser with resolved config', async () => {
    const provider = new PlaywrightProvider({
      launchOptions: { headless: true },
      contextOptions: { viewport: { width: 1200, height: 800 } },
      storageStatePath: null,
      executablePath: '/path/to/chrome',
      channel: 'chrome',
      useCloakBrowser: false,
    });

    const session = await provider.startSession({ sessionName: null });

    expect(mocks.launch).toHaveBeenCalledWith({
      headless: true,
      executablePath: '/path/to/chrome',
      channel: 'chrome',
    });
    expect(mocks.cloakLaunch).not.toHaveBeenCalled();
    expect(mocks.newContext).toHaveBeenCalledWith({
      viewport: { width: 1200, height: 800 },
    });
    expect(session.providerSessionId).toBeNull();
    expect(session.metadata).toMatchObject({ isLocal: true, stealth: false });
  });

  it('launches via cloakbrowser when useCloakBrowser is enabled', async () => {
    const provider = new PlaywrightProvider({
      launchOptions: { headless: true },
      contextOptions: {},
      storageStatePath: null,
      executablePath: null,
      channel: null,
      useCloakBrowser: true,
    });

    const session = await provider.startSession({ sessionName: null });

    expect(mocks.cloakLaunch).toHaveBeenCalledWith({ headless: true });
    expect(mocks.launch).not.toHaveBeenCalled();
    expect(session.metadata).toMatchObject({ isLocal: true, stealth: true });
  });
});
