import type { ResolvedServerConfig } from '../config/serverConfig.js';
import type { ProviderName } from '../types/providerConfig.js';
import { AnchorBrowserProvider } from './AnchorBrowserProvider.js';
import { BrowserbaseProvider } from './BrowserbaseProvider.js';
import { BrowserProvider } from './BrowserProvider.js';
import { CloudflareProvider } from './CloudflareProvider.js';
import { PlaywrightProvider } from './PlaywrightProvider.js';

export const createProviders = (config: ResolvedServerConfig): Map<ProviderName, BrowserProvider> =>
  new Map<ProviderName, BrowserProvider>([
    ['browserbase', new BrowserbaseProvider(config.providers.browserbase)],
    ['anchor', new AnchorBrowserProvider(config.providers.anchor)],
    ['playwright', new PlaywrightProvider(config.providers.playwright)],
    ['cloudflare', new CloudflareProvider(config.providers.cloudflare)],
  ]);
