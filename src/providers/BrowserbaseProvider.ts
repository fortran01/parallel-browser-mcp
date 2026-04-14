import Browserbase from '@browserbasehq/sdk';
import type { SessionCreateParams } from '@browserbasehq/sdk/resources/sessions/sessions.js';
import { chromium } from 'playwright-core';
import type { ResolvedBrowserbaseProviderConfig } from '../config/serverConfig.js';
import type { StartedBrowserSession } from '../types/session.js';
import { buildReplayUrl, resolveContextAndPage } from '../utils/browser.js';
import { BrowserProvider, type ProviderStartSessionParams } from './BrowserProvider.js';

export class BrowserbaseProvider extends BrowserProvider {
  private client: Browserbase | null = null;

  constructor(private readonly config: ResolvedBrowserbaseProviderConfig) {
    super('browserbase');
  }

  async startSession(params: ProviderStartSessionParams): Promise<StartedBrowserSession> {
    if (this.config.projectId === null) {
      throw new Error(
        'Missing Browserbase project ID. Provide it in BROWSER_MCP_CONFIG or BROWSERBASE_PROJECT_ID.',
      );
    }

    const sessionCreateParams = this.buildSessionCreateParams(params);
    const remoteSession = await this.getClient().sessions.create(sessionCreateParams);
    const browser = await chromium.connectOverCDP(remoteSession.connectUrl);
    const { context, page } = await resolveContextAndPage(browser);

    return {
      browser,
      context,
      page,
      providerSessionId: remoteSession.id,
      metadata: {
        connectUrl: remoteSession.connectUrl,
        replayUrl: buildReplayUrl(remoteSession.id),
        sessionStatus: remoteSession.status,
      },
      resolvedProviderConfig: this.config,
    };
  }

  async closeSession(session: StartedBrowserSession): Promise<void> {
    await session.page.close().catch(() => undefined);
    await session.browser.close().catch(() => undefined);
  }

  private buildSessionCreateParams(params: ProviderStartSessionParams): SessionCreateParams {
    const baseParams: SessionCreateParams = {
      ...(this.config.sessionOptions as Partial<SessionCreateParams>),
      projectId: this.config.projectId ?? undefined,
      keepAlive: this.config.keepAlive,
      userMetadata: {
        sessionName: params.sessionName,
      },
    };

    if (this.config.proxy !== null) {
      baseParams.proxies =
        typeof this.config.proxy === 'boolean'
          ? this.config.proxy
          : [this.config.proxy as unknown as SessionCreateParams.BrowserbaseProxyConfig];
    }

    if (this.config.contextId !== null) {
      baseParams.browserSettings = {
        ...(baseParams.browserSettings ?? {}),
        context: {
          id: this.config.contextId,
          persist: this.config.persist,
        },
      };
    }

    return baseParams;
  }

  private getClient(): Browserbase {
    if (this.config.apiKey === null) {
      throw new Error('Missing Browserbase API key. Set BROWSERBASE_API_KEY.');
    }

    if (this.client === null) {
      this.client = new Browserbase({
        apiKey: this.config.apiKey,
      });
    }

    return this.client;
  }
}
