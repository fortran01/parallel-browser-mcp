import 'dotenv/config';
import { ChatAnthropic } from '@langchain/anthropic';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { createAgent } from 'langchain';
import { runLangChainExampleCli } from '../shared/runLangChainExample.js';

const defaultPrompt =
  'Start a local browser session, open Wikipedia, and return the page title plus a short summary of the homepage.';
const browserMcpConfig = JSON.stringify({
  defaultProvider: 'playwright',
  providers: {
    playwright: {
      launchOptions: {
        headless: true,
      },
    },
  },
});
const anthropicModel = process.env.ANTHROPIC_MODEL?.trim() || 'claude-sonnet-4-6';

runLangChainExampleCli({
  defaultPrompt,
  failureMessage: 'Local LangChain example failed:',
  createClient: () =>
    new MultiServerMCPClient({
      browser: {
        transport: 'stdio',
        command: 'npx',
        args: ['parallel-browser-mcp@latest'],
        env: {
          ...process.env,
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
