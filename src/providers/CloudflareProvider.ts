import { chromium } from 'playwright-core';
import type { ResolvedCloudflareProviderConfig } from '../config/serverConfig.js';
import type { StartedBrowserSession } from '../types/session.js';
import { resolveContextAndPage } from '../utils/browser.js';
import { BrowserProvider, type ProviderStartSessionParams } from './BrowserProvider.js';

const CLOUDFLARE_CDP_ENDPOINT =
  'wss://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/browser-rendering/devtools/browser';

export class CloudflareProvider extends BrowserProvider {
  constructor(private readonly config: ResolvedCloudflareProviderConfig) {
    super('cloudflare');
  }

  async startSession(_params: ProviderStartSessionParams): Promise<StartedBrowserSession> {
    if (this.config.apiKey === null) {
      throw new Error('Missing Cloudflare API token. Set CLOUDFLARE_API_TOKEN.');
    }

    if (this.config.accountId === null) {
      throw new Error('Missing Cloudflare account ID. Set CLOUDFLARE_ACCOUNT_ID.');
    }

    const keepAlive = this.config.keepAlive ?? 600000;
    const browserWSEndpoint = CLOUDFLARE_CDP_ENDPOINT.replace(
      '{ACCOUNT_ID}',
      this.config.accountId,
    ) + `?keep_alive=${keepAlive}`;

    const browser = await chromium.connectOverCDP(browserWSEndpoint, {
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
      },
    });

    const { context, page } = await resolveContextAndPage(browser);

    return {
      browser,
      context,
      page,
      providerSessionId: null,
      metadata: {
        browserWSEndpoint,
      },
      resolvedProviderConfig: this.config,
    };
  }

  async closeSession(session: StartedBrowserSession): Promise<void> {
    await session.page.close().catch(() => undefined);
    await session.browser.close().catch(() => undefined);
  }
}
