import {
  chromium,
  type Browser,
  type BrowserContextOptions,
  type LaunchOptions,
} from 'playwright';
import type { ResolvedPlaywrightProviderConfig } from '../config/serverConfig.js';
import type { StartedBrowserSession } from '../types/session.js';
import { BrowserProvider, type ProviderStartSessionParams } from './BrowserProvider.js';

type CloakBrowserModule = {
  launch: (options?: LaunchOptions) => Promise<Browser>;
};

const loadCloakBrowser = async (): Promise<CloakBrowserModule> => {
  // Use an indirect specifier so TypeScript / bundlers don't require `cloakbrowser`
  // to be installed at build time. It's an optional peer the user installs only if
  // they opt into stealth mode.
  const moduleId = 'cloakbrowser';
  try {
    return (await import(/* @vite-ignore */ moduleId)) as CloakBrowserModule;
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Playwright provider has useCloakBrowser enabled but the 'cloakbrowser' package is not installed. ` +
        `Install it with 'npm install cloakbrowser' (https://cloakbrowser.dev/). Underlying error: ${reason}`,
    );
  }
};

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

    const browser = this.config.useCloakBrowser
      ? await (await loadCloakBrowser()).launch(launchOptions)
      : await chromium.launch(launchOptions);
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
        stealth: this.config.useCloakBrowser,
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
