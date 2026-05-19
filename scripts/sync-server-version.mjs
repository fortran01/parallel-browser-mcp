#!/usr/bin/env node
/**
 * Sync the version in server.json with the current package.json version.
 *
 * Wired into the npm `version` lifecycle so `npm version <patch|minor|major>`
 * automatically updates server.json (both top-level `version` and
 * `packages[0].version`) and stages it for the version-bump commit. Keeps the
 * release workflow's version-match guard happy without a manual edit.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const pkgPath = resolve(root, 'package.json');
const serverPath = resolve(root, 'server.json');

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const targetVersion = pkg.version;

if (typeof targetVersion !== 'string' || targetVersion.length === 0) {
  console.error('sync-server-version: package.json has no version field');
  process.exit(1);
}

const server = JSON.parse(readFileSync(serverPath, 'utf8'));

let changed = false;
if (server.version !== targetVersion) {
  server.version = targetVersion;
  changed = true;
}

if (Array.isArray(server.packages)) {
  for (const entry of server.packages) {
    if (entry && entry.version !== targetVersion) {
      entry.version = targetVersion;
      changed = true;
    }
  }
}

if (!changed) {
  console.log(`sync-server-version: server.json already at ${targetVersion}`);
  process.exit(0);
}

writeFileSync(serverPath, `${JSON.stringify(server, null, 2)}\n`);
console.log(`sync-server-version: updated server.json to ${targetVersion}`);
