import 'dotenv/config';
import { ChatAnthropic } from '@langchain/anthropic';
import { MultiServerMCPClient } from '@langchain/mcp-adapters';
import { createAgent } from 'langchain';
import { runLangChainExampleCli } from '../shared/runLangChainExample.js';

const anchorApiKey = process.env.ANCHOR_API_KEY?.trim();
const anthropicModel = process.env.ANTHROPIC_MODEL?.trim() || 'claude-sonnet-4-6';
const defaultPrompt =
  'Start an Anchor session, open Wikipedia, tell me the page title, and use browser_snapshot before you finish.';

if (!anchorApiKey) {
  throw new Error('Missing ANCHOR_API_KEY in examples/anchor/.env');
}

const browserMcpConfig = JSON.stringify({
  defaultProvider: 'anchor',
  providers: {
    anchor: {
      recording: false,
    },
  },
});

runLangChainExampleCli({
  defaultPrompt,
  failureMessage: 'Anchor LangChain example failed:',
  createClient: () =>
    new MultiServerMCPClient({
      browser: {
        transport: 'stdio',
        command: 'npx',
        args: ['parallel-browser-mcp@latest'],
        env: {
          ...process.env,
          ANCHOR_API_KEY: anchorApiKey,
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
