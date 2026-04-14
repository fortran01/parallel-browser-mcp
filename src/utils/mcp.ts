import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

export const textResult = (text: string, isError = false): CallToolResult => ({
  content: [{ type: 'text', text }],
  isError,
});

export const jsonResult = (value: unknown, isError = false): CallToolResult =>
  textResult(JSON.stringify(value, null, 2), isError);

export const imageResult = (summary: string, mimeType: string, data: string): CallToolResult => ({
  content: [
    { type: 'text', text: summary },
    { type: 'image', mimeType, data },
  ],
});
