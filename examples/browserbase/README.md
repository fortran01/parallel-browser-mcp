# Browserbase Example

This is a standalone npm package that connects LangChain to `parallel-browser-mcp` over stdio using `@langchain/mcp-adapters` and runs against Browserbase by default.

## Requirements

- Node `>=20.10.0`
- `ANTHROPIC_API_KEY`
- `BROWSERBASE_API_KEY`
- `BROWSERBASE_PROJECT_ID`

Optional:
- `ANTHROPIC_MODEL`
- custom prompt passed as CLI args

## Install

```bash
cd examples/browserbase
npm install
```

Create or edit the local `.env` file in this folder:

```bash
cd examples/browserbase
$EDITOR .env
```

The example loads `.env` automatically via `dotenv/config`.

## Run

```bash
cd examples/browserbase
npm start -- "Open wikipedia.org, tell me the title, and take a screenshot"
```

By default the example will:
- start `parallel-browser-mcp` with `npx parallel-browser-mcp@latest`
- inject a Browserbase-focused `BROWSER_MCP_CONFIG`
- create a LangChain agent with MCP tools loaded from `parallel-browser-mcp`
- ask the agent to start a Browserbase session, open Wikipedia, and use `browser_screenshot`
- stream agent updates and token output to stdout before printing the final state

## Notes

- This package is intentionally separate from the root package.
- The root `.npmignore` excludes the entire `examples` folder from npm publishing.
- The local `.env` file is git ignored.
