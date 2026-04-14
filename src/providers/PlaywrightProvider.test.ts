import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Browser, BrowserContext, Page } from 'playwright-core';
import { PlaywrightProvider } from './PlaywrightProvider.js';

const mocks = vi.hoisted(() => {
  const newPage = vi.fn(async () => ({}) as Page);
  const newContext = vi.fn(
    async () => ({ newPage, close: vi.fn() }) as unknown as BrowserContext,
  );
  const launch = vi.fn(async () => ({ newContext, close: vi.fn() }) as unknown as Browser);

  return {
    newPage,
    newContext,
    launch,
  };
});

vi.mock('playwright', () => ({
  chromium: {
    launch: mocks.launch,
  },
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
    });

    const session = await provider.startSession({ sessionName: null });

    expect(mocks.launch).toHaveBeenCalledWith({
      headless: true,
      executablePath: '/path/to/chrome',
      channel: 'chrome',
    });
    expect(mocks.newContext).toHaveBeenCalledWith({
      viewport: { width: 1200, height: 800 },
    });
    expect(session.providerSessionId).toBeNull();
  });
});
