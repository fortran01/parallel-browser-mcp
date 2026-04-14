# Anchor Example

This is a standalone npm package that connects LangChain to `parallel-browser-mcp` over stdio using `@langchain/mcp-adapters` and runs against Anchor by default.

## Requirements

- Node `>=20.10.0`
- `ANTHROPIC_API_KEY`
- `ANCHOR_API_KEY`

Optional:
- `ANTHROPIC_MODEL`
- custom prompt passed as CLI args

## Install

```bash
cd examples/anchor
npm install
```

Create or edit the local `.env` file in this folder:

```bash
cd examples/anchor
$EDITOR .env
```

The example loads `.env` automatically via `dotenv/config`.

## Run

```bash
cd examples/anchor
npm start -- "Open wikipedia.org, tell me the title, and use browser_snapshot"
```

By default the example will:
- start `parallel-browser-mcp` with `npx parallel-browser-mcp@latest`
- inject an Anchor-focused `BROWSER_MCP_CONFIG`
- create a LangChain agent with MCP tools loaded from `parallel-browser-mcp`
- ask the agent to start an Anchor session, open Wikipedia, and use `browser_snapshot`
- stream agent updates and token output to stdout before printing the final state

## Notes

- This package is intentionally separate from the root package.
- The root `.npmignore` excludes the entire `examples` folder from npm publishing.
- The local `.env` file is git ignored.
