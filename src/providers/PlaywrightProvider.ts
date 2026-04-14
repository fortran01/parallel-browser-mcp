import { chromium, type BrowserContextOptions, type LaunchOptions } from 'playwright';
import type { ResolvedPlaywrightProviderConfig } from '../config/serverConfig.js';
import type { StartedBrowserSession } from '../types/session.js';
import { resolveContextAndPage } from '../utils/browser.js';
import { BrowserProvider, type ProviderStartSessionParams } from './BrowserProvider.js';

export class PlaywrightProvider extends BrowserProvider {
  constructor(private readonly config: ResolvedPlaywrightProviderConfig) {
    super('playwright');
  }

  async startSession(_params: ProviderStartSessionParams): Promise<StartedBrowserSession> {
    const launchOptions: LaunchOptions = {
      ...(this.config.launchOptions as LaunchOptions),
    };

    if (this.config.executablePath !== null) {
      launchOptions.executablePath = this.config.executablePath;
    }

    if (this.config.channel !== null) {
      launchOptions.channel = this.config.channel;
    }

    const browser = await chromium.launch(launchOptions);
    const contextOptions: BrowserContextOptions = {
      ...(this.config.contextOptions as BrowserContextOptions),
    };

    if (this.config.storageStatePath !== null) {
      contextOptions.storageState = this.config.storageStatePath;
    }

    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

    return {
      browser,
      context,
      page,
      providerSessionId: null,
      metadata: {
        isLocal: true,
      },
      resolvedProviderConfig: this.config,
    };
  }

  async closeSession(session: StartedBrowserSession): Promise<void> {
    await session.page.close().catch(() => undefined);
    await session.context.close().catch(() => undefined);
    await session.browser.close().catch(() => undefined);
  }
}
