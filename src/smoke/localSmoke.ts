import { PlaywrightProvider } from '../providers/PlaywrightProvider.js';

const main = async (): Promise<void> => {
  const provider = new PlaywrightProvider({
    launchOptions: {
      headless: true,
    },
    contextOptions: {},
    storageStatePath: null,
    executablePath: null,
    channel: null,
    useCloakBrowser: false,
  });

  const session = await provider.startSession({
    sessionName: 'local-smoke',
  });

  try {
    await session.page.goto('data:text/html,<title>Browser MCP Smoke</title><h1>Smoke OK</h1>');
    const title = await session.page.title();

    console.error(`Local smoke passed: ${title}`);
  } finally {
    await provider.closeSession(session);
  }
};

main().catch((error) => {
  console.error('Local smoke failed:', error);
  process.exit(1);
});
