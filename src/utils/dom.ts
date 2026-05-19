import type { Page } from 'playwright-core';

interface PageSnapshotNode {
  tag: string;
  text: string;
  role: string | null;
  name: string | null;
  children: PageSnapshotNode[];
}

export interface PageSnapshotResult {
  title: string;
  url: string;
  tree: PageSnapshotNode[];
}

const formatNode = (node: PageSnapshotNode, depth: number): string => {
  const indent = '  '.repeat(depth);
  const parts = [node.tag];

  if (node.role !== null) {
    parts.push(`role=${node.role}`);
  }

  if (node.name !== null) {
    parts.push(`name="${node.name}"`);
  }

  if (node.text.length > 0) {
    parts.push(`text="${node.text}"`);
  }

  const currentLine = `${indent}- ${parts.join(' | ')}`;
  const childLines = node.children.map((child) => formatNode(child, depth + 1));

  return [currentLine, ...childLines].join('\n');
};

export const extractPageSnapshot = async (page: Page): Promise<PageSnapshotResult> =>
  page.evaluate(() => {
    const collectChildren = (element: Element, depth: number): PageSnapshotNode[] => {
      if (depth > 2) {
        return [];
      }

      return Array.from(element.children)
        .slice(0, 8)
        .map((child) => {
          // `innerText` is only defined on HTMLElement — SVG/MathML elements
          // and some custom elements return undefined here, so fall back to
          // `textContent` (available on every Node) before failing to '' .
          const rawText =
            (child as HTMLElement).innerText ?? child.textContent ?? '';

          return {
            tag: child.tagName.toLowerCase(),
            text: rawText.trim().replace(/\s+/g, ' ').slice(0, 120),
            role: child.getAttribute('role'),
            name:
              child.getAttribute('aria-label') ??
              child.getAttribute('name') ??
              child.getAttribute('id'),
            children: collectChildren(child, depth + 1),
          };
        });
    };

    const body = document.body ?? document.documentElement;

    return {
      title: document.title,
      url: window.location.href,
      tree: collectChildren(body, 0),
    };
  });

export const formatPageStructure = (snapshot: PageSnapshotResult): string => {
  const body = snapshot.tree.map((node) => formatNode(node, 0)).join('\n');

  return [`Title: ${snapshot.title}`, `URL: ${snapshot.url}`, '', body].join('\n');
};

export const generateLocatorCandidates = async (
  page: Page,
  selector: string,
): Promise<string[]> =>
  page.locator(selector).first().evaluate((element) => {
    const candidates = new Set<string>();
    const id = element.getAttribute('id');
    const name = element.getAttribute('name');
    const ariaLabel = element.getAttribute('aria-label');
    // See note in extractPageSnapshot: innerText is HTMLElement-only.
    const rawText = (element as HTMLElement).innerText ?? element.textContent ?? '';
    const text = rawText.trim().replace(/\s+/g, ' ');

    if (id !== null && id.length > 0) {
      candidates.add(`#${id}`);
      candidates.add(`[id="${id}"]`);
    }

    if (name !== null && name.length > 0) {
      candidates.add(`[name="${name}"]`);
    }

    if (ariaLabel !== null && ariaLabel.length > 0) {
      candidates.add(`[aria-label="${ariaLabel}"]`);
    }

    if (text.length > 0) {
      candidates.add(`text=${JSON.stringify(text.slice(0, 80))}`);
    }

    candidates.add(element.tagName.toLowerCase());

    return [...candidates];
  });
