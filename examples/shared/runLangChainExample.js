const printUpdateChunk = (chunk) => {
  const entries = Object.entries(chunk);

  for (const [step, content] of entries) {
    console.log(`\n[update] ${step}`);
    console.log(JSON.stringify(content, null, 2));
  }
};

const getPrompt = ({ defaultPrompt }) => process.argv.slice(2).join(' ').trim() || defaultPrompt;

export const runLangChainExample = async ({ buildAgent, createClient, defaultPrompt }) => {
  const prompt = getPrompt({ defaultPrompt });
  const client = createClient();

  try {
    const tools = await client.getTools();
    const agent = await buildAgent({ tools });
    const input = {
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    };
    let finalState = null;

    for await (const [mode, chunk] of await agent.stream(input, {
      streamMode: ['updates', 'messages'],
    })) {
      if (mode === 'updates') {
        printUpdateChunk(chunk);
        finalState = chunk;
        continue;
      }

      if (mode === 'messages') {
        const [message] = chunk;

        if (typeof message?.text === 'string' && message.text.length > 0) {
          process.stdout.write(message.text);
        }
      }
    }

    process.stdout.write('\n');

    if (finalState !== null) {
      console.log('\n[final]');
      console.log(JSON.stringify(finalState, null, 2));
    }
  } finally {
    if (typeof client.close === 'function') {
      await client.close();
    }
  }
};

export const runLangChainExampleCli = ({ failureMessage, ...config }) => {
  runLangChainExample(config).catch((error) => {
    console.error(failureMessage, error);
    process.exit(1);
  });
};
