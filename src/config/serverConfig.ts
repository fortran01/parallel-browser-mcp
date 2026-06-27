import { z } from 'zod';
import {
  anchorProviderConfigSchema,
  browserbaseProviderConfigSchema,
  cloudflareProviderConfigSchema,
  playwrightProviderConfigSchema,
  providerNameSchema,
} from '../types/providerConfig.js';

export const serverConfigSchema = z
  .object({
    defaultProvider: providerNameSchema.nullable().optional(),
    providers: z
      .object({
        browserbase: browserbaseProviderConfigSchema.optional(),
        anchor: anchorProviderConfigSchema.optional(),
        playwright: playwrightProviderConfigSchema.optional(),
        cloudflare: cloudflareProviderConfigSchema.optional(),
      })
      .default({}),
  })
  .strict();

export type ServerConfig = z.infer<typeof serverConfigSchema>;

export interface ResolvedBrowserbaseProviderConfig {
  apiKey: string | null;
  projectId: string | null;
  proxy: boolean | Record<string, unknown> | null;
  keepAlive: boolean;
  contextId: string | null;
  persist: boolean;
  sessionOptions: Record<string, unknown>;
}

export interface ResolvedAnchorProviderConfig {
  apiKey: string | null;
  recording: boolean | null;
  proxy: Record<string, unknown> | null;
  timeout: {
    maxDuration?: number;
    idleTimeout?: number;
  } | null;
  sessionOptions: Record<string, unknown>;
}

export interface ResolvedPlaywrightProviderConfig {
  launchOptions: Record<string, unknown>;
  contextOptions: Record<string, unknown>;
  storageStatePath: string | null;
  executablePath: string | null;
  channel: string | null;
  useCloakBrowser: boolean;
  authSessionPersistence: {
    enabled: boolean;
    rootDir: string;
    saveOnClose: boolean;
    saveOnShutdown: boolean;
  };
}

export interface ResolvedCloudflareProviderConfig {
  apiKey: string | null;
  accountId: string | null;
  keepAlive: number | null;
}

export interface ResolvedServerConfig {
  defaultProvider: 'browserbase' | 'anchor' | 'playwright' | 'cloudflare';
  providers: {
    browserbase: ResolvedBrowserbaseProviderConfig;
    anchor: ResolvedAnchorProviderConfig;
    playwright: ResolvedPlaywrightProviderConfig;
    cloudflare: ResolvedCloudflareProviderConfig;
  };
}
