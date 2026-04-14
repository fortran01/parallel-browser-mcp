import type { Page } from 'playwright-core';
import { describe, expect, it, vi } from 'vitest';
import { extractPageSnapshot, formatPageStructure, generateLocatorCandidates } from './dom.js';

describe('dom utils', () => {
  it('formats a readable page structure', () => {
    const output = formatPageStructure({
      title: 'Example',
      url: 'https://example.com',
      tree: [
        {
          tag: 'button',
          text: 'Submit',
          role: 'button',
          name: 'submit',
          children: [],
        },
      ],
    });

    expect(output).toContain('Title: Example');
    expect(output).toContain('button');
    expect(output).toContain('Submit');
  });

  it('delegates snapshot extraction to page.evaluate', async () => {
    const page = {
      evaluate: vi.fn(async () => ({
        title: 'Snapshot',
        url: 'https://example.com',
        tree: [],
      })),
    } as unknown as Page;

    const result = await extractPageSnapshot(page);

    expect(result.title).toBe('Snapshot');
    expect(page.evaluate).toHaveBeenCalledTimes(1);
  });

  it('delegates locator generation to locator.evaluate', async () => {
    const evaluate = vi.fn(async () => ['#login', '[name="email"]']);
    const page = {
      locator: vi.fn(() => ({
        first: vi.fn(() => ({
          evaluate,
        })),
      })),
    } as unknown as Page;

    const result = await generateLocatorCandidates(page, '#email');

    expect(result).toEqual(['#login', '[name="email"]']);
  });
});
