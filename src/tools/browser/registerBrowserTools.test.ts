import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { describe, expect, it, vi } from 'vitest';
import type { SessionRecord } from '../../types/session.js';
import { registerBrowserTools } from './registerBrowserTools.js';

class FakeServer {
  readonly tools = new Map<string, (args: unknown) => Promise<unknown>>();

  registerTool(name: string, _config: unknown, handler: (args: unknown) => Promise<unknown>): void {
    this.tools.set(name, handler);
  }
}

const createSession = (): SessionRecord => {
  const locator = {
    first: vi.fn(() => locator),
    click: vi.fn(async () => undefined),
    fill: vi.fn(async () => undefined),
    hover: vi.fn(async () => undefined),
    dragTo: vi.fn(async () => undefined),
    selectOption: vi.fn(async () => ['value-1']),
    setInputFiles: vi.fn(async () => undefined),
    evaluate: vi.fn(async (_callback: unknown, script: string) => `evaluated:${script}`),
  };
  const page = {
    goto: vi.fn(async () => ({ status: () => 200 })),
    title: vi.fn(async () => 'Example'),
    url: vi.fn(() => 'https://example.com'),
    screenshot: vi.fn(async () => Buffer.from('png')),
    locator: vi.fn(() => locator),
    waitForSelector: vi.fn(async () => undefined),
    waitForTimeout: vi.fn(async () => undefined),
    evaluate: vi.fn(async (_callback: unknown, script: string) => `page:${script}`),
    keyboard: {
      press: vi.fn(async () => undefined),
      type: vi.fn(async () => undefined),
    },
    mouse: {
      move: vi.fn(async () => undefined),
      click: vi.fn(async () => undefined),
      down: vi.fn(async () => undefined),
      up: vi.fn(async () => undefined),
    },
  };

  return {
    id: 1,
    provider: 'playwright',
    providerSessionId: null,
    browser: {} as never,
    context: {} as never,
    page: page as never,
    metadata: {},
    resolvedProviderConfig: {
      launchOptions: {},
      contextOptions: {},
      storageStatePath: null,
      executablePath: null,
      channel: null,
    },
    sessionName: null,
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  };
};

describe('registerBrowserTools', () => {
  it('registers handlers that use the session page', async () => {
    const fakeServer = new FakeServer();
    const session = createSession();
    const registry = {
      getSessionOrThrow: vi.fn(() => session),
    };

    registerBrowserTools(fakeServer as unknown as McpServer, registry as never);

    const navigate = fakeServer.tools.get('browser_navigate');
    const screenshot = fakeServer.tools.get('browser_screenshot');

    const navigateResult = (await navigate?.({
      sessionId: 1,
      url: 'https://example.com',
    })) as { content: Array<{ text?: string }> };
    const screenshotResult = (await screenshot?.({
      sessionId: 1,
      fullPage: true,
    })) as { content: Array<{ type: string; data?: string }> };

    expect(navigateResult.content[0]?.text).toContain('https://example.com');
    expect(screenshotResult.content[1]).toEqual({
      type: 'image',
      mimeType: 'image/png',
      data: Buffer.from('png').toString('base64'),
    });
  });

  it('returns a tool error when the session is missing', async () => {
    const fakeServer = new FakeServer();
    const registry = {
      getSessionOrThrow: vi.fn(() => {
        throw new Error('Unknown session');
      }),
    };

    registerBrowserTools(fakeServer as unknown as McpServer, registry as never);

    const navigate = fakeServer.tools.get('browser_navigate');
    const result = (await navigate?.({
      sessionId: 9,
      url: 'https://example.com',
    })) as { isError?: boolean; content: Array<{ text?: string }> };

    expect(result.isError).toBe(true);
    expect(result.content[0]?.text).toContain('Tool failed');
  });

  it('covers representative action tools beyond navigation', async () => {
    const fakeServer = new FakeServer();
    const session = createSession();
    const registry = {
      getSessionOrThrow: vi.fn(() => session),
    };

    registerBrowserTools(fakeServer as unknown as McpServer, registry as never);

    const click = fakeServer.tools.get('browser_click');
    const fillForm = fakeServer.tools.get('browser_fill_form');
    const evaluate = fakeServer.tools.get('browser_evaluate');
    const waitForSelector = fakeServer.tools.get('browser_wait_for_selector');
    const keyboardType = fakeServer.tools.get('browser_keyboard_type');
    const mouseDrag = fakeServer.tools.get('browser_mouse_drag');

    await click?.({ sessionId: 1, selector: '#submit' });
    await fillForm?.({
      sessionId: 1,
      fields: [
        { selector: '#first', value: 'Ada' },
        { selector: '#last', value: 'Lovelace' },
      ],
    });
    const evaluateResult = (await evaluate?.({
      sessionId: 1,
      script: 'return 1 + 1;',
    })) as { content: Array<{ text?: string }> };
    await waitForSelector?.({
      sessionId: 1,
      selector: '#status',
      state: 'visible',
    });
    await keyboardType?.({
      sessionId: 1,
      text: 'hello',
      delay: 10,
    });
    await mouseDrag?.({
      sessionId: 1,
      startX: 0,
      startY: 0,
      endX: 20,
      endY: 30,
    });

    expect(session.page.locator).toHaveBeenCalled();
    expect(session.page.waitForSelector).toHaveBeenCalledWith('#status', {
      state: 'visible',
      timeout: undefined,
    });
    expect(evaluateResult.content[0]?.text).toContain('page:return 1 + 1;');
    expect(session.page.keyboard.type).toHaveBeenCalledWith('hello', {
      delay: 10,
    });
    expect(session.page.mouse.up).toHaveBeenCalled();
  });
});
