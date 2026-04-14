import type { Browser, BrowserContext, Page } from 'playwright-core';

export const resolveContextAndPage = async (
  browser: Browser,
): Promise<{ context: BrowserContext; page: Page }> => {
  const existingContext = browser.contexts()[0];
  const context = existingContext ?? (await browser.newContext());
  const existingPage = context.pages()[0];
  const page = existingPage ?? (await context.newPage());

  return { context, page };
};

export const buildReplayUrl = (sessionId: string | null): string | null => {
  if (sessionId === null) {
    return null;
  }

  return `https://www.browserbase.com/sessions/${sessionId}`;
};
