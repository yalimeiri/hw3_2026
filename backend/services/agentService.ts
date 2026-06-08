import { AI_MODEL, MAX_ROUND_TRIPS, OLLAMA_URL, PORT } from '../consts';

const tools = [
  {
    type: 'function',
    function: {
      name: 'filter_notes',
      description: 'Search the notes collection by substring match on content. Returns up to 10 matches.',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query'],
      },
    },
  },
];

interface OllamaToolCall {
  function: {
    name: string;
    arguments: string | { query: string };
  };
}

interface OllamaMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  tool_calls?: OllamaToolCall[];
}

const dispatchToolCall = async (call: OllamaToolCall): Promise<string> => {
  const args = typeof call.function.arguments === 'string'
    ? JSON.parse(call.function.arguments) as { query: string }
    : call.function.arguments;

  if (call.function.name !== 'filter_notes') {
    return JSON.stringify({ error: `unknown tool: ${call.function.name}` });
  }

  const response = await fetch(
    `http://localhost:${PORT}/notes/filter?query=${encodeURIComponent(args.query)}`,
  );

  return await response.text();
};

const callOllama = async (messages: OllamaMessage[]): Promise<OllamaMessage> => {
  let response: Response;

  try {
    response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_MODEL,
        messages,
        tools,
        stream: false,
      }),
    });
  } catch {
    const err = new Error('Ollama unreachable') as Error & { status?: number };
    err.status = 502;
    throw err;
  }

  if (!response.ok) {
    const err = new Error('Ollama unreachable') as Error & { status?: number };
    err.status = 502;
    throw err;
  }

  const data = await response.json() as { message: OllamaMessage };
  return data.message;
};

export const runAgent = async ({ prompt }: { prompt: string }): Promise<{ text: string }> => {
  const messages: OllamaMessage[] = [{ role: 'user', content: prompt }];

  for (let i = 0; i < MAX_ROUND_TRIPS; i++) {
    const message = await callOllama(messages);
    messages.push(message);

    if (!message.tool_calls?.length) {
      return { text: message.content ?? '' };
    }

    for (const call of message.tool_calls) {
      const toolResult = await dispatchToolCall(call);
      messages.push({ role: 'tool', content: toolResult });
    }
  }

  const err = new Error('Agent exceeded round-trip cap') as Error & { status?: number };
  err.status = 504;
  throw err;
};
