# Local Example

This is a standalone npm package that connects LangChain to `parallel-browser-mcp` over stdio using `@langchain/mcp-adapters` and uses the local Playwright provider by default.

## Requirements

- Node `>=20.10.0`
- `ANTHROPIC_API_KEY` set

Optional:
- `ANTHROPIC_MODEL`
- `BROWSER_MCP_CONFIG`

## Install

```bash
cd examples/local
npm install
```

Create or edit the local `.env` file in this folder:

```bash
cd examples/local
$EDITOR .env
```

The example already loads `.env` automatically via `dotenv/config`.

## Run

Run the example:

```bash
cd examples/local
npm start -- "Open example.com and tell me the title"
```

By default the example will:
- start `parallel-browser-mcp` with `npx parallel-browser-mcp@latest`
- use the local Playwright provider in headless mode
- create a LangChain agent with MCP tools loaded from `parallel-browser-mcp`
- stream agent updates and token output to stdout before printing the final state

## Notes

- This package is intentionally separate from the root package.
- The root package `.npmignore` excludes the entire `examples` folder from npm publishing.
- The local `.env` file is git ignored.
