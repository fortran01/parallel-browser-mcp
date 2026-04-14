import Anchorbrowser from 'anchorbrowser';
import type { SessionCreateParams } from 'anchorbrowser/resources/sessions/sessions.js';
import { chromium } from 'playwright-core';
import type { ResolvedAnchorProviderConfig } from '../config/serverConfig.js';
import type { StartedBrowserSession } from '../types/session.js';
import { resolveContextAndPage } from '../utils/browser.js';
import { BrowserProvider, type ProviderStartSessionParams } from './BrowserProvider.js';

export class AnchorBrowserProvider extends BrowserProvider {
  private client: Anchorbrowser | null = null;

  constructor(private readonly config: ResolvedAnchorProviderConfig) {
    super('anchor');
  }

  async startSession(params: ProviderStartSessionParams): Promise<StartedBrowserSession> {
    const sessionCreateParams = this.buildSessionCreateParams(params);
    const remoteSession = await this.getClient().sessions.create(sessionCreateParams);
    const cdpUrl = remoteSession.data?.cdp_url;
    const remoteSessionId = remoteSession.data?.id ?? null;

    if (cdpUrl === undefined) {
      throw new Error('Anchor Browser did not return a CDP URL for the created session.');
    }

    const browser = await chromium.connectOverCDP(cdpUrl);
    const { context, page } = await resolveContextAndPage(browser);

    return {
      browser,
      context,
      page,
      providerSessionId: remoteSessionId,
      metadata: {
        cdpUrl,
        liveViewUrl: remoteSession.data?.live_view_url ?? null,
      },
      resolvedProviderConfig: this.config,
    };
  }

  async closeSession(session: StartedBrowserSession): Promise<void> {
    await session.page.close().catch(() => undefined);
    await session.browser.close().catch(() => undefined);

    if (session.providerSessionId !== null) {
      await this.getClient().sessions.delete(session.providerSessionId).catch(() => undefined);
    }
  }

  private buildSessionCreateParams(params: ProviderStartSessionParams): SessionCreateParams {
    const baseParams: SessionCreateParams = {
      ...(this.config.sessionOptions as Partial<SessionCreateParams>),
    };

    const sessionBlock = {
      ...(baseParams.session ?? {}),
    };

    if (this.config.recording !== null) {
      sessionBlock.recording = {
        active: this.config.recording,
      };
    }

    if (this.config.proxy !== null) {
      sessionBlock.proxy = this.config.proxy as unknown as SessionCreateParams.Session.AnchorProxy;
    }

    if (this.config.timeout !== null) {
      sessionBlock.timeout = {
        idle_timeout: this.config.timeout.idleTimeout,
        max_duration: this.config.timeout.maxDuration,
      };
    }

    if (params.sessionName !== null) {
      sessionBlock.tags = [params.sessionName];
    }

    if (Object.keys(sessionBlock).length > 0) {
      baseParams.session = sessionBlock;
    }

    return baseParams;
  }

  private getClient(): Anchorbrowser {
    if (this.config.apiKey === null) {
      throw new Error('Missing Anchor Browser API key. Set ANCHOR_API_KEY.');
    }

    if (this.client === null) {
      this.client = new Anchorbrowser({
        apiKey: this.config.apiKey,
      });
    }

    return this.client;
  }
}
