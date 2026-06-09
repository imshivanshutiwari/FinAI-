import { join } from 'node:path';
import { existsSync, renameSync } from 'node:fs';

const OLD_DIR = '.dexter';
const NEW_DIR = '.finai';

// Seamless migration of config directory
if (existsSync(OLD_DIR) && !existsSync(NEW_DIR)) {
  try {
    renameSync(OLD_DIR, NEW_DIR);
    // Use stdout directly so we don't disrupt early initialization logs
    process.stdout.write(`[FinAI] Migrated workspace directory from ${OLD_DIR} to ${NEW_DIR}\n`);
  } catch (err) {
    process.stderr.write(`[FinAI] Failed to migrate workspace directory: ${err}\n`);
  }
}

export function getFinaiDir(): string {
  return NEW_DIR;
}

export function finaiPath(...segments: string[]): string {
  return join(getFinaiDir(), ...segments);
}

// Keep legacy aliases for backward compatibility and to minimize code churn
export const getDexterDir = getFinaiDir;
export const dexterPath = finaiPath;
