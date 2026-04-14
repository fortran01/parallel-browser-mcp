import 'dotenv/config';
import { ChatAnthropic } from '@langchain/anthropic';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { createAgent } from 'langchain';
import { runLangChainExampleCli } from '../shared/runLangChainExample.js';

const browserbaseApiKey = process.env.BROWSERBASE_API_KEY?.trim();
const browserbaseProjectId = process.env.BROWSERBASE_PROJECT_ID?.trim();
const anthropicModel = process.env.ANTHROPIC_MODEL?.trim() || 'claude-sonnet-4-6';
const defaultPrompt =
  'Start a Browserbase session, open Wikipedia, tell me the page title, and use browser_screenshot before you finish.';

if (!browserbaseApiKey) {
  throw new Error('Missing BROWSERBASE_API_KEY in examples/browserbase/.env');
}

if (!browserbaseProjectId) {
  throw new Error('Missing BROWSERBASE_PROJECT_ID in examples/browserbase/.env');
}

const browserMcpConfig = JSON.stringify({
  defaultProvider: 'browserbase',
  providers: {
    browserbase: {
      projectId: browserbaseProjectId,
      keepAlive: true,
    },
  },
});

runLangChainExampleCli({
  defaultPrompt,
  failureMessage: 'Browserbase LangChain example failed:',
  createClient: () =>
    new MultiServerMCPClient({
      browser: {
        transport: 'stdio',
        command: 'npx',
        args: ['parallel-browser-mcp@latest'],
        env: {
          ...process.env,
          BROWSERBASE_API_KEY: browserbaseApiKey,
          BROWSER_MCP_CONFIG: browserMcpConfig,
        },
      },
    }),
  buildAgent: async ({ tools }) => {
    const model = new ChatAnthropic({
      model: anthropicModel,
    });

    return createAgent({
      model,
      tools,
    });
  },
});
