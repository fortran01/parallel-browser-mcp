import 'dotenv/config';
import { ChatAnthropic } from '@langchain/anthropic';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { createAgent } from 'langchain';
import { runLangChainExampleCli } from '../shared/runLangChainExample.js';

const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
const anthropicModel = process.env.ANTHROPIC_MODEL?.trim() || 'claude-sonnet-4-6';
const defaultPrompt =
  'Start a Cloudflare session, open Wikipedia, tell me the page title, and use browser_snapshot before you finish.';

if (!cloudflareApiToken) {
  throw new Error('Missing CLOUDFLARE_API_TOKEN in examples/cloudflare/.env');
}

if (!cloudflareAccountId) {
  throw new Error('Missing CLOUDFLARE_ACCOUNT_ID in examples/cloudflare/.env');
}

const browserMcpConfig = JSON.stringify({
  defaultProvider: 'cloudflare',
  providers: {
    cloudflare: {},
  },
});

runLangChainExampleCli({
  defaultPrompt,
  failureMessage: 'Cloudflare LangChain example failed:',
  createClient: () =>
    new MultiServerMCPClient({
      browser: {
        transport: 'stdio',
        command: 'node',
        args: ['../../dist/index.js'],
        env: {
          ...process.env,
          CLOUDFLARE_API_TOKEN: cloudflareApiToken,
          CLOUDFLARE_ACCOUNT_ID: cloudflareAccountId,
          BROWSER_MCP_CONFIG: browserMcpConfig,
        },
      },
    }),
  buildAgent: async ({ tools }) => {
    const model = new ChatAnthropic({
      model: anthropicModel,
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    return createAgent({
      model,
      tools,
    });
  },
});
