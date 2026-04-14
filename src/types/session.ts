import type { Browser, BrowserContext, Page } from 'playwright-core';
import type {
  ProviderName,
} from './providerConfig.js';
import type {
  ResolvedAnchorProviderConfig,
  ResolvedBrowserbaseProviderConfig,
  ResolvedPlaywrightProviderConfig,
} from '../config/serverConfig.js';

export interface StartSessionInput {
  provider?: ProviderName;
  sessionName?: string;
}

export interface StartedBrowserSession {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  providerSessionId: string | null;
  metadata: Record<string, unknown>;
  resolvedProviderConfig:
    | ResolvedBrowserbaseProviderConfig
    | ResolvedAnchorProviderConfig
    | ResolvedPlaywrightProviderConfig;
}

export interface SessionRecord extends StartedBrowserSession {
  id: number;
  provider: ProviderName;
  sessionName: string | null;
  createdAt: string;
  lastUsedAt: string;
}

export interface SessionSummary {
  id: number;
  provider: ProviderName;
  providerSessionId: string | null;
  sessionName: string | null;
  createdAt: string;
  lastUsedAt: string;
  metadata: Record<string, unknown>;
  resolvedProviderConfig:
    | ResolvedBrowserbaseProviderConfig
    | ResolvedAnchorProviderConfig
    | ResolvedPlaywrightProviderConfig;
}

export interface SessionToolContext {
  sessionId: number;
}
