import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadServerConfig } from './loadServerConfig.js';

const ORIGINAL_ENV = { ...process.env };

describe('loadServerConfig', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.restoreAllMocks();
  });

  it('prefers explicit MCP config over env defaults', () => {
    process.env.BROWSERBASE_PROJECT_ID = 'env-project';
    process.env.BROWSER_MCP_CONFIG = JSON.stringify({
      defaultProvider: 'browserbase',
      providers: {
        browserbase: {
          projectId: 'config-project',
          keepAlive: true,
        },
      },
    });

    const config = loadServerConfig();

    expect(config.defaultProvider).toBe('browserbase');
    expect(config.providers.browserbase.projectId).toBe('config-project');
    expect(config.providers.browserbase.keepAlive).toBe(true);
  });

  it('falls back to env defaults when config override is absent', () => {
    delete process.env.BROWSER_MCP_CONFIG;
    process.env.BROWSERBASE_PROJECT_ID = 'env-project';
    process.env.BROWSERBASE_KEEP_ALIVE = 'true';

    const config = loadServerConfig();

    expect(config.defaultProvider).toBe('playwright');
    expect(config.providers.browserbase.projectId).toBe('env-project');
    expect(config.providers.browserbase.keepAlive).toBe(true);
  });

  it('throws a clear error for invalid JSON config', () => {
    process.env.BROWSER_MCP_CONFIG = '{bad json}';

    expect(() => loadServerConfig()).toThrow(/Invalid browser MCP config/);
  });

  it('defaults useCloakBrowser to false and respects env / config overrides', () => {
    delete process.env.BROWSER_MCP_CONFIG;
    delete process.env.PLAYWRIGHT_USE_CLOAKBROWSER;

    expect(loadServerConfig().providers.playwright.useCloakBrowser).toBe(false);

    process.env.PLAYWRIGHT_USE_CLOAKBROWSER = 'true';
    expect(loadServerConfig().providers.playwright.useCloakBrowser).toBe(true);

    delete process.env.PLAYWRIGHT_USE_CLOAKBROWSER;
    process.env.BROWSER_MCP_CONFIG = JSON.stringify({
      providers: { playwright: { useCloakBrowser: true } },
    });
    expect(loadServerConfig().providers.playwright.useCloakBrowser).toBe(true);
  });
});
