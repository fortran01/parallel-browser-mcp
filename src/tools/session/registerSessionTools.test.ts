import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { describe, expect, it, vi } from 'vitest';
import { registerSessionTools } from './registerSessionTools.js';

class FakeServer {
  readonly tools = new Map<string, (args: unknown) => Promise<unknown>>();

  registerTool(name: string, _config: unknown, handler: (args: unknown) => Promise<unknown>): void {
    this.tools.set(name, handler);
  }
}

describe('registerSessionTools', () => {
  it('starts and lists sessions via the registry', async () => {
    const fakeServer = new FakeServer();
    const registry = {
      startSession: vi.fn(async () => ({ id: 1, provider: 'playwright' })),
      closeSession: vi.fn(async () => undefined),
      closeAllSessions: vi.fn(async () => 1),
      getSessions: vi.fn(() => [{ id: 1, provider: 'playwright' }]),
    };

    registerSessionTools(fakeServer as unknown as McpServer, registry as never);

    const startSession = fakeServer.tools.get('start_session');
    const getSessions = fakeServer.tools.get('get_sessions');
    const startResult = (await startSession?.({
      provider: 'playwright',
    })) as { content: Array<{ text?: string }> };
    const listResult = (await getSessions?.({})) as { content: Array<{ text?: string }> };

    expect(startResult.content[0]?.text).toContain('"id": 1');
    expect(listResult.content[0]?.text).toContain('"playwright"');
  });
});
