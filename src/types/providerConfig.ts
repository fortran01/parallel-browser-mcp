import { z } from 'zod';

export const providerNames = ['browserbase', 'anchor', 'playwright'] as const;

export type ProviderName = (typeof providerNames)[number];

const recordSchema = z.record(z.unknown());

export const browserbaseProviderConfigSchema = z
  .object({
    projectId: z.string().min(1).nullable().optional(),
    proxy: z.union([z.boolean(), recordSchema]).nullable().optional(),
    keepAlive: z.boolean().optional(),
    contextId: z.string().min(1).nullable().optional(),
    persist: z.boolean().optional(),
    sessionOptions: recordSchema.optional(),
  })
  .strict();

export type BrowserbaseProviderConfig = z.infer<typeof browserbaseProviderConfigSchema>;

export const anchorTimeoutSchema = z
  .object({
    maxDuration: z.number().positive().optional(),
    idleTimeout: z.number().positive().optional(),
  })
  .strict();

export const anchorProviderConfigSchema = z
  .object({
    recording: z.boolean().optional(),
    proxy: recordSchema.nullable().optional(),
    timeout: anchorTimeoutSchema.nullable().optional(),
    sessionOptions: recordSchema.optional(),
  })
  .strict();

export type AnchorBrowserProviderConfig = z.infer<typeof anchorProviderConfigSchema>;

export const playwrightProviderConfigSchema = z
  .object({
    launchOptions: recordSchema.optional(),
    contextOptions: recordSchema.optional(),
    storageStatePath: z.string().min(1).nullable().optional(),
    executablePath: z.string().min(1).nullable().optional(),
    channel: z.string().min(1).nullable().optional(),
  })
  .strict();

export type PlaywrightProviderConfig = z.infer<typeof playwrightProviderConfigSchema>;

export const providerNameSchema = z.enum(providerNames);
